import { NextResponse } from 'next/server';

/**
 * GET /api/auth/github/install
 * Redirect user to GitHub App installation page
 */
export async function GET() {
  const appClientId = process.env.GITHUB_APP_CLIENT_ID;
  if (!appClientId) {
    return NextResponse.json(
      { error: 'GitHub App not configured' },
      { status: 500 }
    );
  }

  // Redirect to GitHub App OAuth flow
  // This will prompt user to select repositories during authorization
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', appClientId);
  authUrl.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL}/api/auth/github/callback`);
  authUrl.searchParams.set('scope', 'user:email'); // Request email access

  return NextResponse.redirect(authUrl.toString());
}
