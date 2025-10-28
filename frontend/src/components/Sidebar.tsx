"use client";

import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}

export function AppSidebar({ fileStructure, handleSelect }: AppSidebarProps) {
    // Separate folders and root files
    const folders = fileStructure.filter(node => !node.isLeaf && node.children);
    const rootFiles = fileStructure.filter(node => node.isLeaf);

    return (
        <Card className="border-r p-4 overflow-hidden w-full">
            <ScrollArea className="h-full pr-2">
                {/* Root Files Section */}
                {rootFiles.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
                            ROOT FILES
                        </h3>
                        <ul className="space-y-1">
                            {rootFiles.map((file) => (
                                <li
                                    key={file.key}
                                    onClick={() => handleSelect(file)}
                                    className="cursor-pointer rounded-md px-2 py-1 hover:bg-muted transition-colors text-sm flex items-center"
                                >
                                    <span className="mr-2">📄</span>
                                    {file.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Folders Section */}
                <Accordion type="multiple" className="w-full">
                    {folders.map((folder) => (
                        <AccordionItem key={folder.key} value={folder.key}>
                            <AccordionTrigger className="text-left font-semibold">
                                <span className="flex items-center">
                                    <span className="mr-2">📁</span>
                                    {folder.title}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul className="pl-4 space-y-1">
                                    {folder.children?.map((file) => (
                                        <li
                                            key={file.key}
                                            onClick={() => handleSelect(file)}
                                            className="cursor-pointer rounded-md px-2 py-1 hover:bg-muted transition-colors text-sm flex items-center"
                                        >
                                            <span className="mr-2">📄</span>
                                            {file.title}
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {/* Show message if no content */}
                {fileStructure.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                        No files to display
                    </div>
                )}
            </ScrollArea>
        </Card>
    )
}