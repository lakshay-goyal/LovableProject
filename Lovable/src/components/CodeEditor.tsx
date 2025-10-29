"use client"

import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Editor from '@monaco-editor/react';

export default function CodeEditor({ selectedFile }: {
  selectedFile: {
    language: string;
    value: string;
  }
}) {
  return (
    <div className="w-full  h-full">
      <Tabs defaultValue="code-editor" className="h-full">
        <TabsList>
          <TabsTrigger value="code-editor" defaultChecked>Code Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="code-editor">
          <div> <Editor height="90vh"
            language={selectedFile?.language || 'javascript'}
            value={selectedFile?.value || '// Select a file to view its contents'}
            theme='vs-dark'
            defaultValue="// some comment //  const app = express()" /></div>
        </TabsContent >
        <TabsContent value="preview">

        </TabsContent>
      </Tabs >
    </div>
  )
}