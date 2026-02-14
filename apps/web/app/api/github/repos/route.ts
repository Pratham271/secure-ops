import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { githubConnections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { decryptToken } from '@/lib/encryption';
import { Octokit } from '@octokit/rest';

/**
 * GET /api/github/repos
 * Fetch user's GitHub repositories
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get GitHub connection
    const connections = await db
      .select()
      .from(githubConnections)
      .where(eq(githubConnections.userId, session.user.id))
      .limit(1);

    if (connections.length === 0) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 404 }
      );
    }

    const connection = connections[0];
    const accessToken = decryptToken(connection.accessToken);

    // Fetch repositories from GitHub
    const octokit = new Octokit({ auth: accessToken });

    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
      affiliation: 'owner,collaborator',
    });

    // Filter and format repositories
    const formattedRepos = repos
      .filter((repo) => !repo.archived && !repo.disabled)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        description: repo.description,
        language: repo.language,
        updatedAt: repo.updated_at,
        hasIssues: repo.has_issues,
      }))
      .filter((repo) => repo.hasIssues); // Only repos with issues enabled

    return NextResponse.json({ repositories: formattedRepos });
  } catch (error: any) {
    console.error('Error fetching GitHub repos:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
