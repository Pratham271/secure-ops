import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-white">
            SecureOps<span className="text-blue-400">AI</span>
          </h1>
          <Link
            href="/settings-simple"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {session ? 'Settings' : 'Get Started'}
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            AI-Powered Incident Response
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Automatically triage, ticket, and resolve production incidents using
            Archestra MCP with dual-LLM security quarantine
          </p>

          {!session && (
            <Link
              href="/api/auth/github/install"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-lg"
            >
              Install GitHub App to Start
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Intelligent Triage
            </h3>
            <p className="text-gray-300">
              AI agents analyze incidents, determine severity, and prioritize
              based on impact
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Auto Ticketing
            </h3>
            <p className="text-gray-300">
              Automatically creates GitHub issues with context, logs, and
              suggested fixes
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Dual LLM Security
            </h3>
            <p className="text-gray-300">
              Archestra's quarantine prevents prompt injection attacks on your
              AI agents
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Built with Modern Technologies
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-gray-400 text-sm mb-1">Framework</p>
              <p className="text-white font-semibold">Next.js 16</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">AI Platform</p>
              <p className="text-white font-semibold">Archestra MCP</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">LLM Provider</p>
              <p className="text-white font-semibold">Groq (Llama 3.3)</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Database</p>
              <p className="text-white font-semibold">Postgres + Drizzle</p>
            </div>
          </div>
        </div>

        {/* Status */}
        {session && (
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Logged in as{' '}
              <span className="text-white font-semibold">
                {session.user?.email}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
