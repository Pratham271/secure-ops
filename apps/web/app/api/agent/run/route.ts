import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { spawn } from 'child_process';
import { join } from 'path';

/**
 * POST /api/agent/run
 * Trigger the AI agent to process incidents
 * Returns immediately with job ID, agent runs in background
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

    console.log(`🚀 Starting agent for user ${userId}, repo: ${repoFullName || 'all'}`);

    // Path to agent
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
    });
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
