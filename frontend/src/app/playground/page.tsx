"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MonacoEditor from "@monaco-editor/react";

import { AppSidebar } from "@/components/Sidebar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      } catch (error) {
        console.error("Error loading project structure:", error);
      }
    };

    fetchXML();
  }, [isAuthenticated]);

  const handleSelect = (file: FileNode) => {
    if (file.isLeaf) {
      setSelectedFile({
        language: file.language || "plaintext",
        value: file.content || "// Empty file",
      });
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
    <div className="flex h-screen w-screen bg-white text-gray-800">
      <Tabs defaultValue="code-editor" className="flex-1 flex flex-col">
        <TabsList className="bg-gray-100 border-b border-gray-300">
          <TabsTrigger value="code-editor">Code Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Code Editor Tab */}
        <TabsContent value="code-editor" className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <Card className="w-64 h-full border-r border-gray-200 flex flex-col shadow-sm">
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                <AppSidebar 
                  fileStructure={fileStructure} 
                  handleSelect={handleSelect} 
                />
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Editor */}
          <div className="flex-1">
            <MonacoEditor
              height="100%"
              language={selectedFile?.language || "javascript"}
              value={selectedFile?.value || "// Select a file to view its contents"}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
                wordWrap: "on",
              }}
            />
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your live preview will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
