"use client";
import React, { useEffect, useState } from "react";
import { AppSidebar } from "./Sidebar"
import CodeEditor from "./CodeEditor";

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

  // Parse XML from public/projectStructure.xml
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
        return { title: "", key: "" }; // fallback
      };

      // Get all direct children of project root
      const project = xml.documentElement;
      const nodes: FileNode[] = [];
      
      Array.from(project.children).forEach(child => {
        nodes.push(parseElement(child));
      });

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
    <div className="flex h-screen w-screen">
      <div className="w-1/3 h-screen">
        <AppSidebar fileStructure={fileStructure} handleSelect={handleSelect} />
      </div>
      <CodeEditor selectedFile={selectedFile} />
    </div>
  );
}