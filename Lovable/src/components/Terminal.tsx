"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Terminal, 
  Play, 
  Square, 
  RotateCcw, 
  Copy, 
  Trash2,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

export default function TerminalComponent() {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'info',
      content: 'Welcome to the integrated terminal! Type commands below.',
      timestamp: new Date()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input when terminal is clicked
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const addLine = (type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setLines(prev => [...prev, newLine]);
  };

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    // Add command to history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(commandHistory.length);

    // Add command line
    addLine('command', `$ ${command}`);

    // Simulate command execution
    setIsRunning(true);
    
    // Simulate different command responses
    setTimeout(() => {
      if (command === 'clear') {
        setLines([]);
        addLine('info', 'Terminal cleared.');
      } else if (command === 'help') {
        addLine('output', 'Available commands:');
        addLine('output', '  clear     - Clear the terminal');
        addLine('output', '  help      - Show this help message');
        addLine('output', '  ls        - List directory contents');
        addLine('output', '  pwd       - Print working directory');
        addLine('output', '  echo      - Print text');
        addLine('output', '  date      - Show current date and time');
        addLine('output', '  whoami    - Show current user');
      } else if (command === 'ls') {
        addLine('output', 'src/');
        addLine('output', 'public/');
        addLine('output', 'package.json');
        addLine('output', 'README.md');
      } else if (command === 'pwd') {
        addLine('output', '/Users/lakshaygoyal/Desktop/Interview/Lovable/frontend');
      } else if (command.startsWith('echo ')) {
        const text = command.substring(5);
        addLine('output', text);
      } else if (command === 'date') {
        addLine('output', new Date().toString());
      } else if (command === 'whoami') {
        addLine('output', 'developer');
      } else if (command === 'npm run dev') {
        addLine('output', 'Starting development server...');
        addLine('output', 'Local:            http://localhost:3000');
        addLine('output', 'On Your Network:  http://192.168.1.100:3000');
        addLine('info', 'Development server is running');
      } else if (command === 'git status') {
        addLine('output', 'On branch main');
        addLine('output', 'Your branch is up to date with \'origin/main\'.');
        addLine('output', '');
        addLine('output', 'Untracked files:');
        addLine('output', '  (use "git add <file>..." to include in what will be committed)');
        addLine('output', '        .cursor/');
        addLine('output', '        node_modules/');
        addLine('output', '        package-lock.json');
        addLine('output', '        package.json');
        addLine('output', '');
        addLine('output', 'nothing added to commit but untracked files present');
      } else {
        addLine('error', `Command not found: ${command}`);
        addLine('info', 'Type "help" for available commands');
      }
      
      setIsRunning(false);
    }, 500 + Math.random() * 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim()) {
      executeCommand(currentCommand.trim());
      setCurrentCommand('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
        setCurrentCommand(commandHistory[historyIndex - 1]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        setHistoryIndex(historyIndex + 1);
        setCurrentCommand(commandHistory[historyIndex + 1]);
      } else if (historyIndex === commandHistory.length - 1) {
        setHistoryIndex(commandHistory.length);
        setCurrentCommand('');
      }
    }
  };

  const clearTerminal = () => {
    setLines([]);
    addLine('info', 'Terminal cleared.');
  };

  const copyAll = () => {
    const allText = lines.map(line => line.content).join('\n');
    navigator.clipboard.writeText(allText);
  };

  const getLineIcon = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return <ChevronRight className="w-4 h-4 text-green-500" />;
      case 'output':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'info':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-green-600 dark:text-green-400';
      case 'output':
        return 'text-gray-900 dark:text-gray-100';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'info':
        return 'text-gray-500 dark:text-gray-400';
      default:
        return 'text-gray-900 dark:text-gray-100';
    }
  };

  return (
    <Card className="h-full flex flex-col border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Terminal
            <Badge variant="secondary" className="text-xs">
              {lines.length} lines
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTerminal}
              className="h-7 px-2"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAll}
              className="h-7 px-2"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="flex-1 p-0 flex flex-col">
        {/* Terminal Output */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 font-mono text-sm">
          <div className="space-y-1">
            {lines.map((line) => (
              <div
                key={line.id}
                className={`flex items-start gap-2 ${getLineColor(line.type)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getLineIcon(line.type)}
                </div>
                <div className="flex-1 break-words">
                  {line.content}
                </div>
                <div className="flex-shrink-0 text-xs text-gray-400 ml-2">
                  {line.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            ))}
            
            {/* Running indicator */}
            {isRunning && (
              <div className="flex items-center gap-2 text-blue-500">
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <span className="text-sm">Executing command...</span>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <Separator />
        
        {/* Command Input */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex items-center gap-2 flex-1">
              <ChevronRight className="w-4 h-4 text-green-500 flex-shrink-0" />
              <Input
                ref={inputRef}
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command..."
                className="flex-1 font-mono text-sm border-0 bg-transparent focus:ring-0 focus:border-0 p-0"
                disabled={isRunning}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!currentCommand.trim() || isRunning}
              className="px-3"
            >
              {isRunning ? (
                <Square className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </Button>
          </form>
          <p className="text-xs text-gray-400 mt-2">
            Use ↑/↓ arrows for command history • Type "help" for available commands
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
