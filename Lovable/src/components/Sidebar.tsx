"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FileNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  language?: string;
  content?: string;
  children?: FileNode[];
  path?: string;
}

interface AppSidebarProps {
  fileStructure: FileNode[];
  handleSelect: (file: FileNode) => void;
  className?: string;
}

export function AppSidebar({
  fileStructure,
  handleSelect,
  className,
}: AppSidebarProps) {
  // Debug logging
  console.log('AppSidebar received fileStructure:', fileStructure);
  const renderFileIcon = (file: FileNode) => {
    if (!file.isLeaf) return "📁";
    
    const ext = file.title.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'js': '📄',
      'jsx': '⚛️',
      'ts': '📘',
      'tsx': '⚛️',
      'py': '🐍',
      'java': '☕',
      'cpp': '⚙️',
      'c': '⚙️',
      'html': '🌐',
      'css': '🎨',
      'scss': '🎨',
      'json': '📋',
      'md': '📝',
      'txt': '📄',
      'svg': '🖼️',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'ico': '🖼️',
      'config': '⚙️',
      'gitignore': '🚫',
      'env': '🔐',
      'dockerfile': '🐳',
      'yml': '📋',
      'yaml': '📋',
    };
    return iconMap[ext || ''] || '📄';
  };

  const renderNode = (node: FileNode, level = 0) => {
    console.log(`Rendering node: ${node.title}, isLeaf: ${node.isLeaf}, children: ${node.children?.length || 0}, level: ${level}`);
    
    if (node.isLeaf) {
      return (
        <li
          key={node.key}
          onClick={() => handleSelect(node)}
          className={cn(
            "cursor-pointer rounded-md px-3 py-1.5 text-sm flex items-center transition-colors group",
            "hover:bg-accent hover:text-accent-foreground",
            level > 0 && "ml-4"
          )}
        >
          <span className="mr-2 text-muted-foreground group-hover:text-accent-foreground">
            {renderFileIcon(node)}
          </span>
          <span className="truncate">{node.title}</span>
        </li>
      );
    }

    return (
      <li key={node.key} className={cn("space-y-1", level > 0 && "ml-4")}>
        <div className="flex items-center px-3 py-1.5 text-sm font-medium text-foreground">
          <span className="mr-2">📁</span>
          <span className="truncate">{node.title}</span>
        </div>
        {node.children && node.children.length > 0 && (
          <ul className="space-y-1">
            {node.children.map((child) => renderNode(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border-r border-border",
        className
      )}
    >
      {/* Scrollable content area - takes remaining space above footer */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3">
            {/* File Tree */}
            {fileStructure.length > 0 ? (
              <ul className="space-y-1">
                {fileStructure.map((node) => renderNode(node))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <div className="text-3xl mb-2">📂</div>
                <p className="text-sm">No files or folders found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
