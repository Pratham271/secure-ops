import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, githubConnections } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * GET /api/auth/github/install
 * Redirect user to GitHub App installation or settings page
 */
export async function GET() {
  const appSlug = process.env.GITHUB_APP_SLUG;
  if (!appSlug) {
    return NextResponse.json(
      { error: 'GitHub App not configured (GITHUB_APP_SLUG missing)' },
      { status: 500 }
    );
  }

  // Get Clerk user
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.redirect(new URL('/sign-in', process.env.NEXTAUTH_URL!));
  }

  // Check if user already has a GitHub connection
  const connections = await db
    .select()
    .from(githubConnections)
    .where(eq(githubConnections.clerkUserId, clerkUserId))
    .limit(1);

  const existingConnection = connections[0];

  if (existingConnection?.installationId) {
    // User has existing installation - redirect to GitHub settings to manage repos
    const settingsUrl = `https://github.com/settings/installations/${existingConnection.installationId}`;
    return NextResponse.redirect(settingsUrl);
  }

  // New installation - redirect to GitHub App installation page
  const installUrl = `https://github.com/apps/${appSlug}/installations/new`;
  return NextResponse.redirect(installUrl);
}
