import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { githubConnections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  let githubConnection = null;
  const connections = await db
    .select()
    .from(githubConnections)
    .where(eq(githubConnections.userId, session.user.id!))
    .limit(1);

  if (connections.length > 0) {
    githubConnection = connections[0];
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success/Error Messages */}
        {searchParams.success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              ✓ GitHub App installed successfully!
            </p>
          </div>
        )}
        {searchParams.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Error: {decodeURIComponent(searchParams.error)}
            </p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your GitHub App integration
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-8">
            {/* User Info */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Account</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="h-12 w-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {session.user.name}
                    </p>
                    <p className="text-sm text-gray-500">{session.user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* GitHub App Integration */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                GitHub App Integration
              </h2>

              {githubConnection ? (
                <div className="space-y-4">
                  {/* Connection Status */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg
                            className="h-5 w-5 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-sm font-medium text-green-800">
                            GitHub App Installed
                          </p>
                        </div>
                        <p className="text-xs text-green-700">
                          @{githubConnection.githubUsername} •{' '}
                          {githubConnection.selectedRepositories?.length || 0}{' '}
                          repositories selected
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Selected Repositories */}
                  {githubConnection.selectedRepositories && githubConnection.selectedRepositories.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Authorized Repositories
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        {githubConnection.selectedRepositories.map((repo: any) => (
                          <div
                            key={repo.id}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-900">
                                {repo.fullName}
                              </span>
                              {repo.private && (
                                <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                                  Private
                                </span>
                              )}
                              {githubConnection.primaryRepo === repo.fullName && (
                                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                  Primary
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary Repository */}
                  {githubConnection.primaryRepo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Incident tickets</strong> will be created in:{' '}
                        <code className="font-mono">{githubConnection.primaryRepo}</code>
                      </p>
                    </div>
                  )}

                  {/* Reinstall/Update */}
                  <div className="pt-4 border-t border-gray-200">
                    <a
                      href="/api/auth/github/install"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Reinstall or update repository access →
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <svg
                      className="h-10 w-10 text-blue-600 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-blue-900 mb-2">
                        Install SecureOps GitHub App
                      </h3>
                      <p className="text-sm text-blue-800 mb-4">
                        Grant SecureOps access to specific repositories where you
                        want to create incident tickets. You'll choose which
                        repositories to authorize.
                      </p>
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-semibold text-blue-900">
                          Permissions requested:
                        </p>
                        <ul className="text-xs text-blue-800 space-y-1 ml-4">
                          <li>• <strong>Issues</strong> - Create and update incident tickets</li>
                          <li>• <strong>Metadata</strong> - Read repository information</li>
                        </ul>
                      </div>
                      <a
                        href="/api/auth/github/install"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                      >
                        <svg
                          className="h-5 w-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Install GitHub App
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
