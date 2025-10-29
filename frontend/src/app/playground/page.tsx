"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MonacoEditor from "@monaco-editor/react";

import { AppSidebar } from "@/components/Sidebar";
import TerminalComponent from "@/components/Terminal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  Cloud,
  Code,
  BarChart3,
  Plus,
  Eye,
  Share,
  Github,
  Crown,
  Upload,
  MessageCircle,
  Zap,
  ArrowRight,
  X,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Search
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
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
  const { sandboxUrl, isProjectCreating, isFilesLoading, isLLMGenerating, filesRefreshTrigger, setIsFilesLoading, handleProjectStart } = usePlayground();

  console.log('Editor state - sandboxUrl:', sandboxUrl, 'isProjectCreating:', isProjectCreating);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<SelectedFile>({
    language: "plaintext",
    value: "// Select a file to view",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userQuery, setUserQuery] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("code");
  const [filteredFiles, setFilteredFiles] = useState<FileNode[]>([]);
  const [selectedFileName, setSelectedFileName] = useState("Select a file to view");

  console.log('Editor state - sandboxUrl:', sandboxUrl, 'isProjectCreating:', isProjectCreating);

  useEffect(() => {
    if (sandboxUrl && !isProjectCreating) {
      console.log('Switching to preview tab because project is ready');
      setActiveTab("preview");
    }
  }, [sandboxUrl, isProjectCreating]);

  useEffect(() => {
    if (isProjectCreating && activeTab === "code") {
      console.log('Switching to preview tab because project creation started');
      setActiveTab("preview");
    }
  }, [isProjectCreating, activeTab]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          setIsAuthenticated(true);
          const query = searchParams.get('query');
          const projectIdParam = searchParams.get('projectId');
          if (query) {
            setUserQuery(decodeURIComponent(query));
          }
          if (projectIdParam) {
            setProjectId(projectIdParam);
          }
        } else {
          router.push("/signin");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/signin");
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, searchParams]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/files');
        const data = await response.json();

        if (data.success) {
          setFileStructure(data.files);
          setFilteredFiles(data.files);
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

    if (!isFilesLoading) {
      fetchFiles();
    }
  }, [isAuthenticated, filesRefreshTrigger, isFilesLoading]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredFiles(fileStructure);
      return;
    }

    const filterFiles = (files: FileNode[]): FileNode[] => {
      return files.reduce((acc: FileNode[], file) => {
        if (file.isLeaf) {
          if (file.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            acc.push(file);
          }
        } else if (file.children) {
          const filteredChildren = filterFiles(file.children);
          if (filteredChildren.length > 0) {
            acc.push({
              ...file,
              children: filteredChildren
            });
          }
        }
        return acc;
      }, []);
    };

    setFilteredFiles(filterFiles(fileStructure));
  }, [searchTerm, fileStructure]);

  const handleSelect = async (file: FileNode) => {
    if (file.isLeaf) {
      try {
        setSelectedFile({
          language: file.language || "plaintext",
          value: "// Loading file content...",
        });
        setSelectedFileName(file.title);

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

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen bg-white items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner className="h-8 w-8" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-full relative">
      {isLLMGenerating && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
              <Zap className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI is Generating Your Project</h3>
              <p className="text-sm text-gray-600 mt-2">Please wait while we create your application...</p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <div className="mt-4">
              <Spinner className="h-8 w-8 mx-auto" />
            </div>
          </div>
        </div>
      )}

      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search files"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {isFilesLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <Spinner className="w-8 h-8" />
                  <p className="text-sm text-muted-foreground">Loading file structure...</p>
                </div>
              </div>
            ) : (
              <AppSidebar
                fileStructure={filteredFiles}
                handleSelect={handleSelect}
              />
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-50">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="bg-white">
              <TabsTrigger value="code" className="text-sm">Code</TabsTrigger>
              <TabsTrigger value="preview" className="text-sm">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
          {projectId && (
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Project ID: {projectId}
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsContent value="code" className="flex-1 flex flex-col m-0">
            <div className="h-10 border-b border-gray-200 flex items-center px-4 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedFileName}</span>
              </div>
            </div>

            <div className="flex-1">
              <MonacoEditor
                height="100%"
                language={selectedFile?.language || "typescript"}
                value={selectedFile?.value || `import { useState } from 'react'
import heroImage from '../assets/hero-image.png'
import { CheckCircle } from 'lucide-react'

export default function Index() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <nav className="fixed top-0 w-full bg-card/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">BlogifyAI</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">How it works</a>
                <a href="#pricing" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                <a href="#faq" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">FAQ</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Sign In</button>
              <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">Get Started</button>
            </div>
          </div>
        </div>
      </nav>`}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  automaticLayout: true,
                  wordWrap: "on",
                  theme: "vs"
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 flex flex-col m-0">
            {/* Preview Content */}
            <div className="flex-1 bg-white">
              <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-1 text-xs text-yellow-700">
                Debug: sandboxUrl={sandboxUrl ? 'SET' : 'NULL'}, isProjectCreating={isProjectCreating ? 'TRUE' : 'FALSE'}
                <button
                  onClick={() => {
                    console.log('Test Start button clicked');
                    handleProjectStart();
                  }}
                  className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  Test Start
                </button>
                <button
                  onClick={async () => {
                    console.log('Test API button clicked');
                    try {
                      const response = await fetch('/api/prompt', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: 'Create a simple hello world app' })
                      });
                      const data = await response.json();
                      console.log('API response:', data);
                    } catch (error) {
                      console.error('API error:', error);
                    }
                  }}
                  className="ml-2 px-2 py-1 bg-green-500 text-white rounded text-xs"
                >
                  Test API
                </button>
              </div>
              {isProjectCreating ? (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Zap className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Creating Your Project</h3>
                      <p className="text-sm text-gray-600 mt-1">AI is building your application...</p>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      This may take a few moments...
                    </div>
                  </div>
                </div>
              ) : sandboxUrl ? (
                <div className="flex flex-col h-full">
                  <div className="bg-green-50 border-b border-green-200 px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-700 font-medium">Project Ready!</span>
                      <span className="text-xs text-green-600">Live preview below</span>
                    </div>
                  </div>
                  <iframe
                    src={sandboxUrl}
                    className="flex-1 w-full border-0"
                    title="Preview"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">No Preview Available</h3>
                      <p className="text-sm text-gray-600 mt-1">Start a conversation with the AI to create a project</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
