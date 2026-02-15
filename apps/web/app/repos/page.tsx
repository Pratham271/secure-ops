import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db, githubConnections, repositorySettings } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { SyncReposButton } from '@/components/sync-repos-button';
import { ProcessRepoButton } from '@/components/process-repo-button';

export default async function ReposPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Fetch GitHub connections
  const connections = await db
    .select()
    .from(githubConnections)
    .where(eq(githubConnections.clerkUserId, user.id));

  const githubConnection = connections[0] || null;

  // Fetch repository settings
  const repoSettings = githubConnection
    ? await db
        .select()
        .from(repositorySettings)
        .where(
          and(
            eq(repositorySettings.clerkUserId, user.id),
            eq(repositorySettings.connectionId, githubConnection.id)
          )
        )
    : [];

  // If no GitHub connection, redirect to onboarding
  if (!githubConnection) {
    redirect('/onboarding');
  }

  const repositories = githubConnection.repositories || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-sidebar-primary rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-foreground">
                  SecureOps<span className="text-primary">AI</span>
                </h1>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                className="px-4 py-2 text-sm bg-card border border-border text-card-foreground rounded-lg hover:bg-accent transition"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Your Repositories</h2>
          <p className="text-muted-foreground">
            Select a repository to view its incident dashboard
          </p>
        </div>

        {/* GitHub Connection Info */}
        <div className="mb-8 p-4 bg-card border border-border rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            {githubConnection.accountAvatarUrl && (
              <img
                src={githubConnection.accountAvatarUrl}
                alt={githubConnection.githubUsername}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="font-semibold text-foreground">Connected to GitHub</p>
              </div>
              <p className="text-sm text-muted-foreground">
                @{githubConnection.githubUsername} · {repositories.length} repositories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SyncReposButton />
            <Link
              href="/api/auth/github/install"
              className="px-4 py-2 text-sm bg-accent border border-border text-accent-foreground rounded-lg hover:bg-accent/80 transition"
            >
              Manage Repositories
            </Link>
          </div>
        </div>

        {/* Repository Grid */}
        {repositories.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <svg
              className="w-16 h-16 text-muted-foreground mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Repositories</h3>
            <p className="text-muted-foreground mb-6">
              You haven't selected any repositories yet.
            </p>
            <Link
              href="/api/auth/github/install"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition"
            >
              Select Repositories
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => {
              const repoSetting = repoSettings.find((s) => s.repoId === repo.id);
              const [owner, repoName] = repo.fullName.split('/');

              return (
                <Link
                  key={repo.id}
                  href={`/dashboard/${owner}/${repoName}`}
                  className="group bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
                >
                  {/* Repo Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition">
                          {repo.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {repo.fullName}
                        </p>
                      </div>
                    </div>

                    {repo.private && (
                      <span className="px-2 py-1 text-xs bg-accent rounded flex-shrink-0">
                        Private
                      </span>
                    )}
                  </div>

                  {/* Repo Description */}
                  {repo.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {repo.description}
                    </p>
                  )}

                  {/* Repo Metadata */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-primary rounded-full"></span>
                        <span>{repo.language}</span>
                      </div>
                    )}
                    {repoSetting?.isPrimary && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        Primary
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <ProcessRepoButton repoFullName={repo.fullName} />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        View Dashboard
                      </span>
                      <svg
                        className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Add More Repos CTA */}
        {repositories.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/api/auth/github/install"
              className="inline-flex items-center px-6 py-3 bg-card border border-border text-card-foreground rounded-lg hover:bg-accent transition"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add More Repositories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
