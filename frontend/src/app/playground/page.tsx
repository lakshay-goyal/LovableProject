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

interface FileNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  language?: string;
  content?: string;
  children?: FileNode[];
}

interface SelectedFile {
  language: string;
  value: string;
}

export default function Editor() {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("code");
  const [filteredFiles, setFilteredFiles] = useState<FileNode[]>([]);
  const [selectedFileName, setSelectedFileName] = useState("Select a file to view");

  // Check authentication status and get query parameter
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          setIsAuthenticated(true);
          // Get the query parameter from URL
          const query = searchParams.get('query');
          if (query) {
            setUserQuery(decodeURIComponent(query));
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
    
    const fetchXML = async () => {
      try {
        const response = await fetch("./projectStructure.xml");
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "application/xml");

        const parseElement = (element: Element): FileNode => {
          if (element.tagName === "folder") {
            return {
              title: element.getAttribute("name") || "",
              key: Math.random().toString(),
              children: Array.from(element.children).map(parseElement),
            };
          } else if (element.tagName === "file") {
            return {
              title: element.getAttribute("name") || "",
              key: element.getAttribute("key") || "",
              isLeaf: true,
              language: element.getAttribute("language") || "plaintext",
              content: element.textContent?.trim() || "",
            };
          }
          return { title: "", key: "" };
        };

        const project = xml.documentElement;
        const nodes: FileNode[] = Array.from(project.children).map(parseElement);

        setFileStructure(nodes);
        setFilteredFiles(nodes);
      } catch (error) {
        console.error("Error loading project structure:", error);
      }
    };

    fetchXML();
  }, [isAuthenticated]);

  // Filter files based on search term
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

  const handleSelect = (file: FileNode) => {
    if (file.isLeaf) {
      setSelectedFile({
        language: file.language || "plaintext",
        value: file.content || "// Empty file",
      });
      setSelectedFileName(file.title);
    }
  };

  // Show loading spinner while checking authentication
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

  // Don't render the main content if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-full">
      {/* File Explorer Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Search Input */}
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

        {/* File Tree */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <AppSidebar 
              fileStructure={filteredFiles} 
              handleSelect={handleSelect} 
            />
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Tabs Header */}
        <div className="h-12 border-b border-gray-200 flex items-center px-4 bg-gray-50">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white">
              <TabsTrigger value="code" className="text-sm">Code</TabsTrigger>
              <TabsTrigger value="preview" className="text-sm">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsContent value="code" className="flex-1 flex flex-col m-0">
            {/* File Tab */}
            <div className="h-10 border-b border-gray-200 flex items-center px-4 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedFileName}</span>
              </div>
            </div>

            {/* Code Editor */}
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
      {/* Navigation */}
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
              <iframe
                src="/"
                className="w-full h-full border-0"
                title="Preview"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
