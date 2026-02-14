import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db, githubConnections } from '@/lib/db';
import { eq } from 'drizzle-orm';

interface DashboardPageProps {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { owner, repo } = await params;
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const repoFullName = `${owner}/${repo}`;

  // Fetch GitHub connection
  const connections = await db
    .select()
    .from(githubConnections)
    .where(eq(githubConnections.clerkUserId, user.id))
    .limit(1);

  const githubConnection = connections[0] || null;

  // Check if user has access to this repo
  const hasAccess = githubConnection?.repositories?.some(
    (r) => r.fullName === repoFullName
  );

  if (!hasAccess) {
    redirect('/repos?error=no_access');
  }

  // Find the specific repository
  const repository = githubConnection.repositories?.find(
    (r) => r.fullName === repoFullName
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/repos" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-sidebar-primary rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-foreground">
                  SecureOps<span className="text-primary">AI</span>
                </h1>
              </Link>
              <span className="text-muted-foreground">/</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
                <span className="font-medium text-foreground">{repoFullName}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/repos"
                className="px-4 py-2 text-sm bg-card border border-border text-card-foreground rounded-lg hover:bg-accent transition"
              >
                ← Back to Repos
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Incident Dashboard</h2>
          <p className="text-muted-foreground">Monitor and manage incidents for {repoFullName}</p>
        </div>

        {/* Repository Info Card */}
        <div className="mb-8 p-6 bg-card border border-border rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">{repository?.name}</h3>
                {repository?.description && (
                  <p className="text-muted-foreground mb-2">{repository.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  {repository?.language && (
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-primary rounded-full"></span>
                      <span className="text-muted-foreground">{repository.language}</span>
                    </div>
                  )}
                  {repository?.private && (
                    <span className="px-2 py-1 bg-accent rounded text-xs">Private</span>
                  )}
                </div>
              </div>
            </div>

            <a
              href={`https://github.com/${repoFullName}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">15</p>
            <p className="text-sm text-muted-foreground">Total Incidents</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">5</p>
            <p className="text-sm text-muted-foreground">Tickets Created</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">3</p>
            <p className="text-sm text-muted-foreground">Critical Priority</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">~2s</p>
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Incidents</h3>
            <div className="space-y-3">
              {[
                { id: 'INC-2026-001', severity: 'critical', service: 'api-gateway', desc: 'High error rate detected' },
                { id: 'INC-2026-003', severity: 'critical', service: 'auth-service', desc: 'Authentication service down' },
                { id: 'INC-2026-011', severity: 'critical', service: 'payment-gateway', desc: 'Payment provider API errors' },
                { id: 'INC-2026-002', severity: 'high', service: 'payment-processor', desc: 'Security alert detected' },
                { id: 'INC-2026-004', severity: 'high', service: 'notification-service', desc: 'Email delivery delayed' },
              ].map((incident) => (
                <div key={incident.id} className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    incident.severity === 'critical' ? 'bg-red-500' :
                    incident.severity === 'high' ? 'bg-orange-500' :
                    'bg-yellow-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{incident.service}</p>
                    <p className="text-xs text-muted-foreground truncate">{incident.desc}</p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{incident.id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-foreground">Incident Feed MCP</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-accent px-2 py-1 rounded">Running</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-foreground">GitHub Ticketing MCP</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-accent px-2 py-1 rounded">Running</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-foreground">AI Agent (Groq)</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-accent px-2 py-1 rounded">Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-foreground">GitHub Integration</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-accent px-2 py-1 rounded">Connected</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Repository</p>
              <p className="text-sm font-mono text-foreground">{repoFullName}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Installation ID: {githubConnection?.installationId}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 bg-accent rounded-lg hover:bg-accent/80 transition text-left">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">Run Agent</p>
                <p className="text-xs text-muted-foreground">Process pending incidents</p>
              </div>
            </button>

            <a
              href={`https://github.com/${repoFullName}/issues/new`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-accent rounded-lg hover:bg-accent/80 transition text-left"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">Create Ticket</p>
                <p className="text-xs text-muted-foreground">Manual GitHub issue</p>
              </div>
            </a>

            <Link
              href="/repos"
              className="flex items-center gap-3 p-4 bg-accent rounded-lg hover:bg-accent/80 transition text-left"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">Switch Repository</p>
                <p className="text-xs text-muted-foreground">View other repos</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
