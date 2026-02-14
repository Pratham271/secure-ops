import { db } from '@/lib/db';
import { githubConnections } from '@/lib/db/schema';
import { cookies } from 'next/headers';

export default async function SettingsPage(props: {
  searchParams: Promise<{ success?: string; error?: string; user_id?: string }>;
}) {
  const searchParams = await props.searchParams;

  // Get user_id from cookie or query param
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('secureops_user_id');
  const userId = searchParams.user_id || userIdCookie?.value;

  let githubConnection = null;

  if (userId) {
    const connections = await db
      .select()
      .from(githubConnections)
      .limit(100); // Get all for now, filter by userId when we have proper auth

    // Find connection for this user (simplified for hackathon)
    githubConnection = connections[0] || null;
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
            <h1 className="text-2xl font-semibold text-gray-900">
              SecureOps Settings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your GitHub App integration
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-8">
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
                            ✓ GitHub App Installed
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
                  {githubConnection.selectedRepositories &&
                   githubConnection.selectedRepositories.length > 0 && (
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
                              <span className="text-sm text-gray-900 font-mono">
                                {repo.fullName}
                              </span>
                              {repo.private && (
                                <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                                  Private
                                </span>
                              )}
                              {githubConnection.primaryRepo === repo.fullName && (
                                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded font-medium">
                                  ⭐ Primary
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
                      <p className="text-sm text-blue-900">
                        <strong>📋 Incident tickets</strong> will be created in:{' '}
                        <code className="px-2 py-1 bg-blue-100 rounded font-mono text-xs">
                          {githubConnection.primaryRepo}
                        </code>
                      </p>
                    </div>
                  )}

                  {/* Reinstall/Update */}
                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                    <a
                      href="/api/auth/github/install"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Update repository access →
                    </a>
                    <a
                      href="/"
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      ← Back to home
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-16 w-16 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Install SecureOps GitHub App
                      </h3>
                      <p className="text-base text-gray-700 mb-4 leading-relaxed">
                        Connect SecureOps to specific repositories where you want
                        to create incident tickets. You'll choose exactly which
                        repositories to authorize.
                      </p>
                      <div className="space-y-3 mb-6">
                        <p className="text-sm font-semibold text-gray-900">
                          ✓ Permissions requested:
                        </p>
                        <ul className="text-sm text-gray-700 space-y-2 ml-4">
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>
                              <strong>Issues (Read & Write)</strong> - Create and
                              update incident tickets
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>
                              <strong>Metadata (Read)</strong> - Access repository
                              information
                            </span>
                          </li>
                        </ul>
                      </div>
                      <a
                        href="/api/auth/github/install"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition"
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
