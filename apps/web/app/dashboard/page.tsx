import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db, githubConnections } from '@/lib/db';
import { eq } from 'drizzle-orm';

export default async function DashboardPage() {
  const session = await auth();

  // Fetch GitHub connection (don't require session to view dashboard)
  let githubConnection = null;
  if (session) {
    const connections = await db
      .select()
      .from(githubConnections)
      .where(eq(githubConnections.isActive, true))
      .limit(1);

    githubConnection = connections[0] || null;
  }

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
                href="/settings-simple"
                className="px-4 py-2 text-sm bg-card border border-border text-card-foreground rounded-lg hover:bg-accent transition"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Not Authenticated Banner */}
        {!session && (
          <div className="mb-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Demo Mode</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You're viewing the dashboard in demo mode. Connect your GitHub account to enable full functionality.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm font-medium"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Incident Dashboard</h2>
          <p className="text-muted-foreground">Monitor and manage production incidents in real-time</p>
        </div>

        {/* GitHub Connection Status */}
        {session && !githubConnection ? (
          <div className="mb-8 p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-destructive mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">GitHub Not Connected</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Connect your GitHub account to enable automatic ticket creation
                </p>
                <Link
                  href="/api/auth/github/install"
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm font-medium"
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  Install GitHub App
                </Link>
              </div>
            </div>
          </div>
        ) : session && githubConnection ? (
          <div className="mb-8 p-6 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <p className="font-semibold text-foreground">GitHub Connected</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tickets will be created in{' '}
                    <span className="font-mono text-primary">{githubConnection.primaryRepo}</span>
                  </p>
                </div>
              </div>
              <a
                href={`https://github.com/${githubConnection.primaryRepo}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm bg-accent border border-border text-accent-foreground rounded-lg hover:bg-accent/80 transition"
              >
                View Issues
              </a>
            </div>
          </div>
        ) : null}

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
                  <div className={`w-2 h-2 ${githubConnection ? 'bg-green-500' : 'bg-gray-500'} rounded-full`}></div>
                  <span className="text-sm text-foreground">GitHub Integration</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-accent px-2 py-1 rounded">
                  {githubConnection ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Last Agent Run</p>
              <p className="text-xs font-mono text-foreground">5 incidents processed · 5 tickets created</p>
              <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
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
              href={githubConnection ? `https://github.com/${githubConnection.primaryRepo}/issues/new` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-4 bg-accent rounded-lg transition text-left ${
                githubConnection ? 'hover:bg-accent/80' : 'opacity-50 cursor-not-allowed'
              }`}
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
              href="/settings-simple"
              className="flex items-center gap-3 p-4 bg-accent rounded-lg hover:bg-accent/80 transition text-left"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">Settings</p>
                <p className="text-xs text-muted-foreground">Configure integrations</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
