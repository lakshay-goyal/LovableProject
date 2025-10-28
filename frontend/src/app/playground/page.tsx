"use client";

import React, { useEffect, useState } from "react";
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
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<SelectedFile>({
    language: "plaintext",
    value: "// Select a file to view",
  });

  useEffect(() => {
    const fetchXML = async () => {
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
    };

    fetchXML();
  }, []);

  const handleSelect = (file: FileNode) => {
    if (file.isLeaf) {
      setSelectedFile({
        language: file.language || "plaintext",
        value: file.content || "// Empty file",
      });
    }
  };

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
                <AppSidebar fileStructure={fileStructure} handleSelect={handleSelect} />
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
