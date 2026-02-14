import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * GitHub App authentication and API utilities
 */

let privateKey: string;

// Load private key from file or environment variable
if (process.env.GITHUB_APP_PRIVATE_KEY) {
  // Use inline private key from env (for production)
  privateKey = process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n');
} else if (process.env.GITHUB_APP_PRIVATE_KEY_PATH) {
  // Load from file (for development)
  const keyPath = join(process.cwd(), process.env.GITHUB_APP_PRIVATE_KEY_PATH);
  privateKey = readFileSync(keyPath, 'utf-8');
} else {
  throw new Error('GitHub App private key not configured. Set GITHUB_APP_PRIVATE_KEY or GITHUB_APP_PRIVATE_KEY_PATH');
}

const appId = process.env.GITHUB_APP_ID;
if (!appId) {
  throw new Error('GITHUB_APP_ID not set in environment variables');
}

// Initialize GitHub App
export const githubApp = new App({
  appId,
  privateKey,
  oauth: {
    clientId: process.env.GITHUB_APP_CLIENT_ID!,
    clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
  },
});

/**
 * Get an Octokit instance authenticated as the app installation
 * This gives access to the repositories the user selected during installation
 */
export async function getInstallationOctokit(installationId: number): Promise<Octokit> {
  const octokit = await githubApp.getInstallationOctokit(installationId);
  return octokit;
}

/**
 * Get installation access token
 * These tokens are scoped to only the repositories selected during installation
 * They expire after 1 hour
 */
export async function getInstallationAccessToken(installationId: number): Promise<string> {
  const { token } = await githubApp.octokit.request(
    'POST /app/installations/{installation_id}/access_tokens',
    {
      installation_id: installationId,
    }
  );
  return token;
}

/**
 * Exchange OAuth code for installation access
 */
export async function exchangeCodeForInstallation(code: string) {
  const { data } = await githubApp.octokit.request('POST /login/oauth/access_token', {
    client_id: process.env.GITHUB_APP_CLIENT_ID!,
    client_secret: process.env.GITHUB_APP_CLIENT_SECRET!,
    code,
  });

  return data;
}
