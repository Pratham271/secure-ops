import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, githubConnections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { githubApp, getInstallationOctokit } from '@/lib/github-app';

/**
 * GET /api/auth/github/callback
 * Handle GitHub App installation callback
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  let installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action');
  const state = searchParams.get('state'); // User ID

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings-simple?error=no_code', process.env.NEXTAUTH_URL!)
    );
  }

  try {
    // Exchange code for access token using direct fetch (not through App octokit)
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_APP_CLIENT_ID!,
        client_secret: process.env.GITHUB_APP_CLIENT_SECRET!,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || 'No access token received from GitHub');
    }

    // Create Octokit instance with the access token
    const { Octokit } = await import('@octokit/rest');
    const userOctokit = new Octokit({ auth: tokenData.access_token });

    const { data: githubUser } = await userOctokit.rest.users.getAuthenticated();

    // Get user's email (use public email or create synthetic one)
    let userEmail = githubUser.email;

    if (!userEmail) {
      // GitHub App doesn't have access to private emails
      // Use synthetic email based on username (like GitHub does)
      userEmail = `${githubUser.login}@users.noreply.github.com`;
    }

    // Get or create user in our database
    let user = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    let userId: string;
    if (user.length === 0) {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          email: userEmail,
          name: githubUser.name || githubUser.login,
        })
        .returning();
      userId = newUser.id;
    } else {
      userId = user[0].id;
    }

    // Get installation information using the user's access token
    if (!installationId) {
      // If no installation_id in query params, fetch it
      const installationsResponse = await fetch(
        'https://api.github.com/user/installations',
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: 'application/vnd.github+json',
          },
        }
      );

      const installationsData = await installationsResponse.json();

      if (!installationsData.installations || installationsData.installations.length === 0) {
        return NextResponse.redirect(
          new URL('/settings-simple?error=no_installation', process.env.NEXTAUTH_URL!)
        );
      }

      // Use the most recent installation
      installationId = installationsData.installations[0].id.toString();
    }

    return handleInstallation(userId, parseInt(installationId), tokenData.access_token);
  } catch (error: any) {
    console.error('GitHub App callback error:', error);
    return NextResponse.redirect(
      new URL(`/settings-simple?error=${encodeURIComponent(error.message)}`, process.env.NEXTAUTH_URL!)
    );
  }
}

async function handleInstallation(userId: string, installationId: number, userAccessToken: string) {
  try {
    // Get repositories this installation has access to using user token
    const reposResponse = await fetch(
      `https://api.github.com/user/installations/${installationId}/repositories`,
      {
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (!reposResponse.ok) {
      const errorData = await reposResponse.json();
      console.error('Repos fetch error:', errorData);
      throw new Error(`Failed to fetch repositories: ${errorData.message || reposResponse.statusText}`);
    }

    const reposData = await reposResponse.json();

    console.log('Repos data:', JSON.stringify(reposData, null, 2));

    if (!reposData.repositories || reposData.repositories.length === 0) {
      throw new Error('No repositories found for installation');
    }

    // Use the first repository's owner as the account info
    const firstRepo = reposData.repositories[0];
    const accountInfo = firstRepo.owner;

    const selectedRepositories = reposData.repositories.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
    }));

    // Store or update GitHub connection
    const existing = await db
      .select()
      .from(githubConnections)
      .where(eq(githubConnections.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing connection
      await db
        .update(githubConnections)
        .set({
          installationId,
          githubUserId: accountInfo.id.toString(),
          githubUsername: accountInfo.login,
          accountType: accountInfo.type,
          accountAvatarUrl: accountInfo.avatar_url,
          selectedRepositories,
          primaryRepo: selectedRepositories[0]?.fullName || null,
          permissions: null, // Not available from this endpoint
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(githubConnections.userId, userId));
    } else {
      // Create new connection
      await db.insert(githubConnections).values({
        userId,
        installationId,
        githubUserId: accountInfo.id.toString(),
        githubUsername: accountInfo.login,
        accountType: accountInfo.type,
        accountAvatarUrl: accountInfo.avatar_url,
        selectedRepositories,
        primaryRepo: selectedRepositories[0]?.fullName || null,
        permissions: null, // Not available from this endpoint
        isActive: true,
      });
    }

    // Redirect back to settings with success
    return NextResponse.redirect(
      new URL('/settings-simple?success=true', process.env.NEXTAUTH_URL!)
    );
  } catch (error: any) {
    console.error('Handle installation error:', error);
    return NextResponse.redirect(
      new URL(`/settings-simple?error=${encodeURIComponent(error.message)}`, process.env.NEXTAUTH_URL!)
    );
  }
}
