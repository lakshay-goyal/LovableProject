import { NextRequest, NextResponse } from 'next/server';

let lastActivityTime = Date.now();
let sandboxRestartTimer: NodeJS.Timeout | null = null;
let isRestarting = false;

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    lastActivityTime = Date.now();

    if (sandboxRestartTimer) {
      clearTimeout(sandboxRestartTimer);
      sandboxRestartTimer = null;
    }

    sandboxRestartTimer = setTimeout(async () => {
      if (!isRestarting) {
        await restartSandbox();
      }
    }, 2 * 60 * 1000);

    console.log(`Heartbeat received: ${action} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      lastActivity: lastActivityTime,
      message: 'Heartbeat recorded'
    });

  } catch (error) {
    console.error('Error in heartbeat API:', error);
    return NextResponse.json(
      { error: 'Failed to record heartbeat' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const now = Date.now();
  const timeSinceLastActivity = now - lastActivityTime;
  const isActive = timeSinceLastActivity < 2 * 60 * 1000;

  return NextResponse.json({
    success: true,
    lastActivity: lastActivityTime,
    timeSinceLastActivity,
    isActive,
    isRestarting
  });
}

async function restartSandbox() {
  if (isRestarting) return;

  isRestarting = true;
  console.log('Restarting sandbox due to inactivity...');

  try {
    const { cleanupSandbox, initializeSandbox } = await import('../../prompt/llm/tools');

    await cleanupSandbox();

    await new Promise(resolve => setTimeout(resolve, 1000));

    await initializeSandbox();

    console.log('Sandbox restarted successfully');

    if (sandboxRestartTimer) {
      clearTimeout(sandboxRestartTimer);
      sandboxRestartTimer = null;
    }

    sandboxRestartTimer = setTimeout(async () => {
      if (!isRestarting) {
        await restartSandbox();
      }
    }, 2 * 60 * 1000);

  } catch (error) {
    console.error('Error restarting sandbox:', error);

    setTimeout(async () => {
      if (!isRestarting) {
        console.log('Retrying sandbox restart...');
        await restartSandbox();
      }
    }, 5000);

  } finally {
    isRestarting = false;
  }
}

export async function DELETE() {
  if (sandboxRestartTimer) {
    clearTimeout(sandboxRestartTimer);
    sandboxRestartTimer = null;
  }

  return NextResponse.json({
    success: true,
    message: 'Heartbeat timer cleared'
  });
}
