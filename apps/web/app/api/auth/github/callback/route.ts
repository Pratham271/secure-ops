import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, githubConnections } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * GET /api/auth/github/callback
 * Handle GitHub App installation callback (Clerk-enabled)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  let installationId = searchParams.get('installation_id');

  // Get Clerk user
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.redirect(new URL('/sign-in?error=not_authenticated', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/repos?error=no_code', request.url));
  }

  try {
    // Exchange code for access token
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

    // Create Octokit instance
    const { Octokit } = await import('@octokit/rest');
    const userOctokit = new Octokit({ auth: tokenData.access_token });

    const { data: githubUser } = await userOctokit.rest.users.getAuthenticated();

    // Get installation ID if not provided
    if (!installationId) {
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
        return NextResponse.redirect(new URL('/repos?error=no_installation', request.url));
      }

      installationId = installationsData.installations[0].id.toString();
    }

    return handleInstallation(clerkUserId, parseInt(installationId), tokenData.access_token, githubUser, request);
  } catch (error: any) {
    console.error('GitHub App callback error:', error);
    return NextResponse.redirect(
      new URL(`/repos?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}

async function handleInstallation(
  clerkUserId: string,
  installationId: number,
  userAccessToken: string,
  githubUser: any,
  request: NextRequest
) {
  try {
    // Get repositories
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
      throw new Error(`Failed to fetch repositories: ${errorData.message || reposResponse.statusText}`);
    }

    const reposData = await reposResponse.json();

    if (!reposData.repositories || reposData.repositories.length === 0) {
      throw new Error('No repositories found for installation');
    }

    // Use the first repository's owner as the account info
    const firstRepo = reposData.repositories[0];
    const accountInfo = firstRepo.owner;

    // Map repositories with enhanced metadata
    const repositories = reposData.repositories.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      description: repo.description,
      language: repo.language,
      updatedAt: repo.updated_at,
    }));

    // Check for existing connection
    const existing = await db
      .select()
      .from(githubConnections)
      .where(eq(githubConnections.clerkUserId, clerkUserId))
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
          repositories,
          permissions: null,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(githubConnections.clerkUserId, clerkUserId));
    } else {
      // Create new connection
      await db.insert(githubConnections).values({
        clerkUserId,
        installationId,
        githubUserId: accountInfo.id.toString(),
        githubUsername: accountInfo.login,
        accountType: accountInfo.type,
        accountAvatarUrl: accountInfo.avatar_url,
        repositories,
        permissions: null,
        isActive: true,
      });
    }

    // Get first repository full name for processing
    const firstRepoFullName = repositories[0]?.fullName;

    // Redirect to processing page to trigger agent
    const redirectUrl = firstRepoFullName
      ? `/processing?repo=${encodeURIComponent(firstRepoFullName)}`
      : '/processing';

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error: any) {
    console.error('Handle installation error:', error);
    return NextResponse.redirect(
      new URL(`/repos?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
