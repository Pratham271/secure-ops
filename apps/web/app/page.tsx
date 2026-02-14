import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';

export default async function HomePage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-sidebar to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent_70%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-sidebar-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              SecureOps<span className="text-primary">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/repos"
                  className="px-4 py-2 bg-card border border-border text-card-foreground rounded-lg hover:bg-accent transition"
                >
                  My Repos
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                    },
                  }}
                />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-4 py-2 text-foreground hover:text-primary transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 pt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-sm text-muted-foreground">Built for 2Fast2MCP Hackathon</span>
          </div>

          <h2 className="text-6xl md:text-7xl font-bold text-foreground mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            AI-Powered Incident Response
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Automatically triage, ticket, and resolve production incidents using
            <span className="text-primary font-semibold"> Archestra MCP </span>
            with dual-LLM security quarantine
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link
                href="/repos"
                className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition text-lg shadow-lg"
              >
                View My Repositories
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : (
              <Link
                href="/sign-up"
                className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition text-lg shadow-lg"
              >
                Get Started Free
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}

            <a
              href="https://github.com/anthropics/archestra-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-card border border-border text-card-foreground font-semibold rounded-lg hover:bg-accent transition text-lg"
            >
              Learn About MCP
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Intelligent Triage
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              AI agents analyze incidents, determine severity, and prioritize based on impact using Groq's Llama 3.3 70B model
            </p>
          </div>

          <div className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Auto Ticketing
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Automatically creates GitHub issues with context, affected users, severity labels, and detailed incident data
            </p>
          </div>

          <div className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Dual LLM Security
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Archestra's quarantine prevents prompt injection attacks on your AI agents by isolating untrusted data
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-card border border-border rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
            Built with Modern Technologies
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-muted-foreground text-sm mb-2">Framework</p>
              <p className="text-foreground font-semibold">Next.js 16</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-muted-foreground text-sm mb-2">AI Platform</p>
              <p className="text-foreground font-semibold">Archestra MCP</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-muted-foreground text-sm mb-2">LLM Provider</p>
              <p className="text-foreground font-semibold">Groq Llama 3.3</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-muted-foreground text-sm mb-2">Database</p>
              <p className="text-foreground font-semibold">Postgres</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-muted-foreground text-sm mb-2">Integration</p>
              <p className="text-foreground font-semibold">GitHub App</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-card border border-border rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
            How It Works
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Monitor</h4>
                <p className="text-sm text-muted-foreground">Incident feed collects alerts from your systems</p>
              </div>
              <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-border -translate-x-1/2" />
            </div>
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Triage</h4>
                <p className="text-sm text-muted-foreground">AI analyzes severity and impact with LLM</p>
              </div>
              <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-border -translate-x-1/2" />
            </div>
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Ticket</h4>
                <p className="text-sm text-muted-foreground">Auto-creates GitHub issues with details</p>
              </div>
              <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-border -translate-x-1/2" />
            </div>
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                  <span className="text-primary font-bold">4</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Resolve</h4>
                <p className="text-sm text-muted-foreground">Track and manage incidents in GitHub</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        {user && (
          <div className="text-center p-6 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-sm text-muted-foreground">
                Signed in as{' '}
                <span className="text-foreground font-semibold">
                  {user.emailAddresses[0]?.emailAddress || user.username}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
