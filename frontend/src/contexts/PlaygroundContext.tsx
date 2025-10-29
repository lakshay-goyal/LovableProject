"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSandboxHeartbeat } from '@/hooks/useSandboxHeartbeat';

interface PlaygroundContextType {
  sandboxUrl: string | null;
  isProjectCreating: boolean;
  isFilesLoading: boolean;
  isLLMGenerating: boolean;
  filesRefreshTrigger: number;
  setSandboxUrl: (url: string | null) => void;
  setIsProjectCreating: (creating: boolean) => void;
  setIsFilesLoading: (loading: boolean) => void;
  setIsLLMGenerating: (generating: boolean) => void;
  handleProjectCreated: (url: string) => void;
  handleProjectStart: () => void;
  triggerFilesRefresh: () => void;
  refreshFilesAndPreview: () => Promise<void>;
  recordActivity: (action: string) => void;
}

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(undefined);

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [sandboxUrl, setSandboxUrl] = useState<string | null>(null);
  const [isProjectCreating, setIsProjectCreating] = useState(false);
  const [isFilesLoading, setIsFilesLoading] = useState(false);
  const [isLLMGenerating, setIsLLMGenerating] = useState(false);
  const [filesRefreshTrigger, setFilesRefreshTrigger] = useState(0);

  // Initialize heartbeat system
  const { startHeartbeat, stopHeartbeat, recordActivity } = useSandboxHeartbeat({
    interval: 30000, // 30 seconds
    onError: (error) => {
      console.error('❌ Heartbeat error:', error);
    },
    onSuccess: () => {
      console.log('💓 Heartbeat successful');
    }
  });

  const handleProjectCreated = (url: string) => {
    console.log('Project created callback triggered with URL:', url);
    setSandboxUrl(url);
    setIsProjectCreating(false);
    // Set files loading state and trigger refresh after project is created
    setIsFilesLoading(true);
    setFilesRefreshTrigger(prev => prev + 1);
    // Start heartbeat when project is created
    startHeartbeat();
    recordActivity('project_created');
    console.log('State updated - sandboxUrl set to:', url, 'isProjectCreating set to false, isFilesLoading set to true');
  };

  const handleProjectStart = () => {
    console.log('Project start triggered in context');
    setIsProjectCreating(true);
    setIsLLMGenerating(true);
    recordActivity('project_start');
    console.log('State updated - isProjectCreating set to true, isLLMGenerating set to true');
  };

  const triggerFilesRefresh = () => {
    setFilesRefreshTrigger(prev => prev + 1);
    recordActivity('files_refresh');
  };

  const refreshFilesAndPreview = async () => {
    console.log('Refreshing files and preview from E2B...');
    try {
      setIsFilesLoading(true);
      recordActivity('files_refresh_start');
      
      // Fetch updated file structure from E2B
      const response = await fetch('/api/files');
      const data = await response.json();
      
      if (data.success) {
        console.log('Files refreshed successfully');
        setFilesRefreshTrigger(prev => prev + 1);
        recordActivity('files_refresh_success');
      } else {
        console.error('Error refreshing files:', data.error);
        recordActivity('files_refresh_error');
      }
    } catch (error) {
      console.error('Error refreshing files and preview:', error);
      recordActivity('files_refresh_error');
    } finally {
      setIsFilesLoading(false);
    }
  };

  // Cleanup heartbeat on unmount
  useEffect(() => {
    return () => {
      stopHeartbeat();
    };
  }, [stopHeartbeat]);

  return (
    <PlaygroundContext.Provider
      value={{
        sandboxUrl,
        isProjectCreating,
        isFilesLoading,
        isLLMGenerating,
        filesRefreshTrigger,
        setSandboxUrl,
        setIsProjectCreating,
        setIsFilesLoading,
        setIsLLMGenerating,
        handleProjectCreated,
        handleProjectStart,
        triggerFilesRefresh,
        refreshFilesAndPreview,
        recordActivity,
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  );
}

export function usePlayground() {
  const context = useContext(PlaygroundContext);
  if (context === undefined) {
    throw new Error('usePlayground must be used within a PlaygroundProvider');
  }
  return context;
}
