import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * POST /api/agent/run
 * Trigger the AI agent to process incidents
 * Returns immediately with job ID, agent runs in background
 *
 * Note: In serverless environments (Vercel), this returns a mock response.
 * For local development with full agent support, run the agent manually.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get repo info from request body
    const body = await request.json();
    const { repoFullName } = body;

    console.log(`🚀 Agent trigger received for user ${userId}, repo: ${repoFullName || 'all'}`);

    // Check if we're in a serverless environment (Vercel)
    const isServerless = process.env.VERCEL === '1' || !process.env.NODE_ENV?.includes('development');

    if (isServerless) {
      // In serverless environments, we can't spawn background processes
      // Return a mock response for demo purposes
      console.log('⚠️ Running in serverless mode - agent execution simulated');

      return NextResponse.json({
        success: true,
        message: 'Agent processing simulated (serverless environment)',
        jobId: `agent-${Date.now()}`,
        estimatedTime: '30 seconds',
        mode: 'serverless',
        note: 'For full agent execution, run locally or deploy to a traditional server',
      });
    }

    // Local development: spawn the actual agent
    try {
      const { spawn } = await import('child_process');
      const { join } = await import('path');

      const agentPath = join(process.cwd(), '../../packages/agent/dist/index.js');

      // Spawn agent process in background
      const agentProcess = spawn('node', [agentPath], {
        detached: true,
        stdio: 'ignore',
        env: {
          ...process.env,
          USER_ID: userId,
          REPO_FULL_NAME: repoFullName || '',
        },
      });

      // Detach the process so it continues running
      agentProcess.unref();

      console.log(`✅ Agent started with PID: ${agentProcess.pid}`);

      return NextResponse.json({
        success: true,
        message: 'Agent started processing incidents',
        jobId: `agent-${Date.now()}`,
        estimatedTime: '30 seconds',
        mode: 'local',
        pid: agentProcess.pid,
      });
    } catch (spawnError: any) {
      console.error('Failed to spawn agent:', spawnError);

      return NextResponse.json({
        success: false,
        error: 'Agent execution not available in this environment',
        message: 'Please run the agent manually: cd packages/agent && pnpm start',
      }, { status: 503 });
    }
  } catch (error: any) {
    console.error('Error starting agent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start agent' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agent/run
 * Get agent status
 */
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // TODO: Implement status checking via database
  // For now, return a mock status
  return NextResponse.json({
    status: 'running',
    message: 'Agent is processing incidents',
  });
}
