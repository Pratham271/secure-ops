import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { githubConnections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/github/select-repo
 * Save selected repository for incident tickets
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { repository } = body;

    if (!repository || typeof repository !== 'string') {
      return NextResponse.json(
        { error: 'Invalid repository format' },
        { status: 400 }
      );
    }

    // Validate format: owner/repo
    if (!repository.includes('/')) {
      return NextResponse.json(
        { error: 'Repository must be in format: owner/repo' },
        { status: 400 }
      );
    }

    // Update selected repository
    await db
      .update(githubConnections)
      .set({
        selectedRepo: repository,
        updatedAt: new Date(),
      })
      .where(eq(githubConnections.userId, session.user.id));

    return NextResponse.json({
      success: true,
      selectedRepo: repository,
    });
  } catch (error: any) {
    console.error('Error selecting repository:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save repository selection' },
      { status: 500 }
    );
  }
}
