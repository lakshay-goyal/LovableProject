"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlaygroundContextType {
  sandboxUrl: string | null;
  isProjectCreating: boolean;
  setSandboxUrl: (url: string | null) => void;
  setIsProjectCreating: (creating: boolean) => void;
  handleProjectCreated: (url: string) => void;
  handleProjectStart: () => void;
}

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(undefined);

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [sandboxUrl, setSandboxUrl] = useState<string | null>(null);
  const [isProjectCreating, setIsProjectCreating] = useState(false);

  const handleProjectCreated = (url: string) => {
    console.log('Project created callback triggered with URL:', url);
    setSandboxUrl(url);
    setIsProjectCreating(false);
    console.log('State updated - sandboxUrl set to:', url, 'isProjectCreating set to false');
  };

  const handleProjectStart = () => {
    console.log('Project start triggered in context');
    setIsProjectCreating(true);
    console.log('State updated - isProjectCreating set to true');
  };

  return (
    <PlaygroundContext.Provider
      value={{
        sandboxUrl,
        isProjectCreating,
        setSandboxUrl,
        setIsProjectCreating,
        handleProjectCreated,
        handleProjectStart,
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
