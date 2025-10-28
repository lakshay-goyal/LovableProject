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
  const folders = fileStructure.filter((n) => !n.isLeaf && n.children);
  const rootFiles = fileStructure.filter((n) => n.isLeaf);

  const renderFiles = (files: FileNode[], level = 0) => (
    <ul className={cn("space-y-1", level > 0 && "pl-4")}>
      {files.map((file) => (
        <li
          key={file.key}
          onClick={() => handleSelect(file)}
          className={cn(
            "cursor-pointer rounded-md px-3 py-1.5 text-sm flex items-center transition-colors group",
            "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <span className="mr-2 text-muted-foreground group-hover:text-accent-foreground">
            📄
          </span>
          <span className="truncate">{file.title}</span>
        </li>
      ))}
    </ul>
  );

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
          <div className="p-3 space-y-3">
            {/* Root Files */}
            {rootFiles.length > 0 && renderFiles(rootFiles)}

            {/* Folders */}
            {folders.length > 0 && (
              <Accordion type="multiple" className="w-full space-y-1">
                {folders.map((folder) => (
                  <AccordionItem
                    key={folder.key}
                    value={folder.key}
                    className="border-none"
                  >
                    <AccordionTrigger
                      className={cn(
                        "py-1.5 px-3 text-sm rounded-md flex items-center transition-colors",
                        "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <span className="flex items-center">
                        <span className="mr-2">📁</span>
                        <span className="truncate">{folder.title}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-3 pt-1">
                      {folder.children && renderFiles(folder.children, 1)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

            {/* Empty state */}
            {fileStructure.length === 0 && (
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
