import { useEffect, useRef, useCallback } from 'react';

interface HeartbeatOptions {
  interval?: number; // Heartbeat interval in milliseconds
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export function useSandboxHeartbeat(options: HeartbeatOptions = {}) {
  const {
    interval = 30000, // 30 seconds default
    onError,
    onSuccess
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  const sendHeartbeat = useCallback(async (action: string = 'user_activity') => {
    try {
      const response = await fetch('/api/sandbox/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error(`Heartbeat failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('💓 Heartbeat sent successfully:', data);
      onSuccess?.();
    } catch (error) {
      console.error('❌ Heartbeat error:', error);
      onError?.(error as Error);
    }
  }, [onError, onSuccess]);

  const startHeartbeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Send initial heartbeat
    sendHeartbeat('heartbeat_start');

    // Set up interval
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        sendHeartbeat('heartbeat_ping');
      }
    }, interval);
  }, [sendHeartbeat, interval]);

  const stopHeartbeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    sendHeartbeat('heartbeat_stop');
  }, [sendHeartbeat]);

  const recordActivity = useCallback((action: string) => {
    if (isActiveRef.current) {
      sendHeartbeat(action);
    }
  }, [sendHeartbeat]);

  // Track user activity events
  useEffect(() => {
    const handleUserActivity = () => {
      recordActivity('user_interaction');
    };

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus'
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [recordActivity]);

  // Track visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false;
        recordActivity('page_hidden');
      } else {
        isActiveRef.current = true;
        recordActivity('page_visible');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [recordActivity]);

  // Cleanup on unmount and page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopHeartbeat();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      stopHeartbeat();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stopHeartbeat]);

  return {
    startHeartbeat,
    stopHeartbeat,
    recordActivity,
    sendHeartbeat
  };
}
