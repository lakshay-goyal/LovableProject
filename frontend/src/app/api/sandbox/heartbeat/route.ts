import { NextRequest, NextResponse } from 'next/server';

// Global state to track sandbox activity
let lastActivityTime = Date.now();
let sandboxRestartTimer: NodeJS.Timeout | null = null;
let isRestarting = false;

// Heartbeat endpoint to track user activity
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    // Update last activity time
    lastActivityTime = Date.now();
    
    // Clear existing restart timer if user is active
    if (sandboxRestartTimer) {
      clearTimeout(sandboxRestartTimer);
      sandboxRestartTimer = null;
    }
    
    // Set up new restart timer (10 minutes after 2 minutes of inactivity)
    sandboxRestartTimer = setTimeout(async () => {
      if (!isRestarting) {
        await restartSandbox();
      }
    }, 2 * 60 * 1000); // 2 minutes
    
    console.log(`💓 Heartbeat received: ${action} at ${new Date().toISOString()}`);
    
    return NextResponse.json({
      success: true,
      lastActivity: lastActivityTime,
      message: 'Heartbeat recorded'
    });
    
  } catch (error) {
    console.error('❌ Error in heartbeat API:', error);
    return NextResponse.json(
      { error: 'Failed to record heartbeat' },
      { status: 500 }
    );
  }
}

// Get current activity status
export async function GET() {
  const now = Date.now();
  const timeSinceLastActivity = now - lastActivityTime;
  const isActive = timeSinceLastActivity < 2 * 60 * 1000; // 2 minutes
  
  return NextResponse.json({
    success: true,
    lastActivity: lastActivityTime,
    timeSinceLastActivity,
    isActive,
    isRestarting
  });
}

// Restart sandbox function
async function restartSandbox() {
  if (isRestarting) return;
  
  isRestarting = true;
  console.log('🔄 Restarting sandbox due to inactivity...');
  
  try {
    // Import cleanup function dynamically to avoid circular dependencies
    const { cleanupSandbox, initializeSandbox } = await import('../../prompt/llm/tools');
    
    // Clean up existing sandbox
    await cleanupSandbox();
    
    // Wait a moment before reinitializing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Initialize new sandbox
    await initializeSandbox();
    
    console.log('✅ Sandbox restarted successfully');
    
    // Reset the restart timer after successful restart
    if (sandboxRestartTimer) {
      clearTimeout(sandboxRestartTimer);
      sandboxRestartTimer = null;
    }
    
    // Set up new restart timer
    sandboxRestartTimer = setTimeout(async () => {
      if (!isRestarting) {
        await restartSandbox();
      }
    }, 2 * 60 * 1000); // 2 minutes
    
  } catch (error) {
    console.error('❌ Error restarting sandbox:', error);
    
    // Retry restart after a delay if it failed
    setTimeout(async () => {
      if (!isRestarting) {
        console.log('🔄 Retrying sandbox restart...');
        await restartSandbox();
      }
    }, 5000); // 5 seconds delay before retry
    
  } finally {
    isRestarting = false;
  }
}

// Cleanup function for graceful shutdown
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
