import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, githubConnections } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * POST /api/auth/github/sync
 * Refresh repository list from GitHub for existing installation
 */
export async function POST(request: NextRequest) {
  try {
    // Get Clerk user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get existing GitHub connection
    const connections = await db
      .select()
      .from(githubConnections)
      .where(eq(githubConnections.clerkUserId, clerkUserId))
      .limit(1);

    const connection = connections[0];

    if (!connection) {
      return NextResponse.json(
        { error: 'No GitHub connection found' },
        { status: 404 }
      );
    }

    // Get installation access token
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

    if (!appId || !privateKey) {
      return NextResponse.json(
        { error: 'GitHub App credentials not configured' },
        { status: 500 }
      );
    }

    // Create JWT for GitHub App authentication
    const { App } = await import('@octokit/app');
    const app = new App({
      appId,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    });

    const octokit = await app.getInstallationOctokit(connection.installationId);

    // Fetch updated repository list
    const { data: reposData } = await octokit.rest.apps.listReposAccessibleToInstallation({
      per_page: 100,
    });

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

    // Update database
    await db
      .update(githubConnections)
      .set({
        repositories,
        updatedAt: new Date(),
      })
      .where(eq(githubConnections.clerkUserId, clerkUserId));

    return NextResponse.json({
      success: true,
      repositoryCount: repositories.length,
      repositories,
    });
  } catch (error: any) {
    console.error('GitHub sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync repositories' },
      { status: 500 }
    );
  }
}
