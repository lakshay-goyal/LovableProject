"use client";
import React, { useEffect, useState } from "react";
import { AppSidebar } from "./Sidebar"
import CodeEditor from "./CodeEditor";
import { usePlayground } from "@/contexts/PlaygroundContext";

interface FileNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  language?: string;
  content?: string;
  children?: FileNode[];
  path?: string;
}

interface SelectedFile {
  language: string;
  value: string;
}

export default function Editor() {
  const { filesRefreshTrigger, isFilesLoading, setIsFilesLoading } = usePlayground();
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<SelectedFile>({
    language: "plaintext",
    value: "// Select a file to view",
  });

  // Fetch files from E2B sandbox
  useEffect(() => {
    if (isFilesLoading) return;
    
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/files');
        const data = await response.json();
        
        if (data.success) {
          setFileStructure(data.files);
          setIsFilesLoading(false);
        } else {
          console.error("Error loading files:", data.error);
          setIsFilesLoading(false);
        }
      } catch (error) {
        console.error("Error loading files:", error);
        setIsFilesLoading(false);
      }
    };

    fetchFiles();
  }, [filesRefreshTrigger, isFilesLoading, setIsFilesLoading]);

  const handleSelect = async (file: FileNode) => {
    if (file.isLeaf) {
      try {
        // Show loading state
        setSelectedFile({
          language: file.language || "plaintext",
          value: "// Loading file content...",
        });

        // Fetch file content from E2B sandbox
        const response = await fetch(`/api/files/${encodeURIComponent(file.path || file.key)}`);
        const data = await response.json();
        
        if (data.success) {
          setSelectedFile({
            language: data.language || file.language || "plaintext",
            value: data.content || "// Empty file",
          });
        } else {
          setSelectedFile({
            language: file.language || "plaintext",
            value: `// Error loading file: ${data.error || 'Unknown error'}`,
          });
        }
      } catch (error) {
        console.error("Error loading file content:", error);
        setSelectedFile({
          language: file.language || "plaintext",
          value: `// Error loading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }
  };

  return (
    <div className="flex h-screen w-screen">
      <div className="w-1/3 h-screen">
        {isFilesLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-muted-foreground">Loading file structure...</p>
            </div>
          </div>
        ) : (
          <AppSidebar fileStructure={fileStructure} handleSelect={handleSelect} />
        )}
      </div>
      <CodeEditor selectedFile={selectedFile} />
    </div>
  );
}