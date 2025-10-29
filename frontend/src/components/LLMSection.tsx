import React, { useState, useRef, useEffect } from "react";
import { usePlayground } from "@/contexts/PlaygroundContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  MoreVertical, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  Sparkles,
  MessageSquare,
  Clock,
  Settings,
  Trash2,
  Download,
  Share,
  Star,
  RefreshCw,
  Zap,
  Brain,
  Lightbulb,
  Code,
  FileText,
  Maximize2,
  Minimize2,
  PanelLeft,
  PanelRight,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Palette,
  Sliders,
  MessageCircle,
  Terminal,
  BookOpen,
  HelpCircle,
  Info,
  X,
  Plus,
  Minus,
  RotateCcw,
  Play,
  Pause,
  Square
} from "lucide-react"

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  reactions?: {
    thumbsUp: number;
    thumbsDown: number;
  };
  type?: 'text' | 'code' | 'suggestion' | 'error';
  isCode?: boolean;
  language?: string;
  isStarred?: boolean;
}

interface LLMSectionProps {
  userQuery?: string | null;
}

export default function LLMSection({ userQuery }: LLMSectionProps) {
  const { handleProjectCreated, handleProjectStart, setIsLLMGenerating, refreshFilesAndPreview, recordActivity } = usePlayground();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiPersonality, setAiPersonality] = useState<'helpful' | 'technical' | 'creative'>('helpful');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aiTemperature, setAiTemperature] = useState([0.7]);
  const [aiCreativity, setAiCreativity] = useState([0.5]);
  const [activeTab, setActiveTab] = useState('chat');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize with user query from homepage
  useEffect(() => {
    if (userQuery && messages.length === 0) {
      const initialMessage: Message = {
        id: Date.now().toString(),
        content: userQuery,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages([initialMessage]);
      
      // Notify parent that project creation is starting
      console.log('Initial message - calling handleProjectStart callback');
      handleProjectStart();
      console.log('Initial message - handleProjectStart callback called');
      
      // Generate AI response
      generateAIResponse(userQuery);
    }
  }, [userQuery, messages.length, handleProjectStart]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const generateAIResponse = async (userMessage: string) => {
    console.log('generateAIResponse called with:', userMessage);
    recordActivity('llm_query_start');
    setIsLoading(true);
    setIsTyping(true);
    setAiThinking(true);
    
    try {
      // Make actual LLM API call
      const response = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('LLM Response data:', data);
      
      if (data.success && data.sandboxUrl) {
        console.log('Project created with sandbox URL:', data.sandboxUrl);
        recordActivity('llm_query_success');
        // Notify parent component about project creation
        handleProjectCreated(data.sandboxUrl);
        
        // Fetch updated file structure and preview URL from E2B after successful completion
        console.log('Fetching updated file structure from E2B...');
        await refreshFilesAndPreview();
      } else {
        console.log('No sandbox URL in response or API call failed');
        recordActivity('llm_query_no_sandbox');
      }

      // Determine if the response should be treated as code
      const isCodeResponse = data.response.includes('```') || data.response.includes('function') || data.response.includes('const') || data.response.includes('import');
      const language = isCodeResponse ? 'javascript' : undefined;
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'I apologize, but I encountered an error processing your request.',
        sender: 'ai',
        timestamp: new Date(),
        type: isCodeResponse ? 'code' : 'text',
        isCode: isCodeResponse,
        language: language,
        reactions: {
          thumbsUp: 0,
          thumbsDown: 0
        }
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error calling LLM API:', error);
      recordActivity('llm_query_error');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'error',
        reactions: {
          thumbsUp: 0,
          thumbsDown: 0
        }
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setAiThinking(false);
      setIsLLMGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    // Notify parent that project creation is starting
    console.log('Calling handleProjectStart callback');
    handleProjectStart();
    console.log('handleProjectStart callback called');
    
    // Generate AI response
    await generateAIResponse(inputMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const addReaction = (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? {
            ...msg,
            reactions: {
              ...msg.reactions!,
              [reaction]: msg.reactions![reaction] + 1
            }
          }
        : msg
    ));
  };

  const toggleStar = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isStarred: !msg.isStarred }
        : msg
    ));
  };

  const clearConversation = () => {
    setMessages([]);
  };

  const exportConversation = () => {
    const conversationText = messages.map(msg => 
      `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <TooltipProvider>
      <div className="w-72 h-screen border-l border-border bg-background flex flex-col overflow-hidden">
        {/* Header Panel - Fixed height */}
        <div className="flex-shrink-0 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center shadow-md">
                  <Brain className="w-4 h-4 text-white dark:text-black" />
                </div>
                <div>
                  <h2 className="font-semibold text-base text-black dark:text-white">AI Assistant</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black dark:text-white">AI Personality</span>
                <div className="flex gap-1">
                  {['helpful', 'technical', 'creative'].map((mode) => (
                    <Button
                      key={mode}
                      variant={aiPersonality === mode ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAiPersonality(mode as any)}
                      className={`h-6 text-xs capitalize px-2 ${
                        aiPersonality === mode 
                          ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-black dark:text-white">Temperature: {aiTemperature[0]}</span>
                </div>
                <Slider
                  value={aiTemperature}
                  onValueChange={setAiTemperature}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-black dark:text-white">Creativity: {aiCreativity[0]}</span>
                </div>
                <Slider
                  value={aiCreativity}
                  onValueChange={setAiCreativity}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Messages Area - Scrollable */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="p-3 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-48">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Brain className="w-8 h-8 text-white dark:text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-black dark:text-white">AI Assistant</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Start a conversation
                      </p>
                    </div>
                    <div className="flex gap-1 justify-center">
                      <Badge variant="outline" className="text-xs px-2 py-1 border-gray-300 dark:border-gray-600">
                        <Lightbulb className="w-3 h-3 mr-1" />
                        Helpful
                      </Badge>
                      <Badge variant="outline" className="text-xs px-2 py-1 border-gray-300 dark:border-gray-600">
                        <Code className="w-3 h-3 mr-1" />
                        Technical
                      </Badge>
                      <Badge variant="outline" className="text-xs px-2 py-1 border-gray-300 dark:border-gray-600">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Creative
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Avatar className="w-8 h-8 shadow-sm">
                      <AvatarFallback className={
                        message.sender === 'user' 
                          ? 'bg-black dark:bg-white text-white dark:text-black text-xs' 
                          : 'bg-gray-800 dark:bg-gray-200 text-white dark:text-black text-xs'
                      }>
                        {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 max-w-[85%] ${
                      message.sender === 'user' ? 'text-right' : ''
                    }`}>
                      <div className={`rounded-xl px-3 py-2 text-sm shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-black dark:bg-white text-white dark:text-black ml-auto'
                          : message.isCode
                          ? 'bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-900 border border-gray-700 dark:border-gray-300 font-mono'
                          : 'bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}>
                        {message.isCode ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-600 border-b border-gray-700 dark:border-gray-300 pb-1">
                              <div className="flex items-center gap-1">
                                <Code className="w-3 h-3" />
                                <span className="font-mono">{message.language || 'code'}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-black hover:bg-gray-700 dark:hover:bg-gray-300"
                                onClick={() => copyToClipboard(message.content)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <pre className="whitespace-pre-wrap text-xs leading-relaxed">
                              <code>{message.content}</code>
                            </pre>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                        )}
                      </div>
                      
                      <div className={`flex items-center gap-2 mt-2 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        {message.sender === 'ai' && (
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                  onClick={() => copyToClipboard(message.content)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy message</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-6 w-6 p-0 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-full ${
                                    message.isStarred ? 'text-yellow-500' : 'text-gray-400'
                                  }`}
                                  onClick={() => toggleStar(message.id)}
                                >
                                  <Star className={`w-3 h-3 ${message.isStarred ? 'fill-current' : ''}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {message.isStarred ? 'Remove from favorites' : 'Add to favorites'}
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900 rounded-full"
                                  onClick={() => addReaction(message.id, 'thumbsUp')}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Like this response</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                                  onClick={() => addReaction(message.id, 'thumbsDown')}
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Dislike this response</TooltipContent>
                            </Tooltip>
                            
                            {message.reactions && (message.reactions.thumbsUp > 0 || message.reactions.thumbsDown > 0) && (
                              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 ml-1">
                                {message.reactions.thumbsUp > 0 && (
                                  <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                                    <ThumbsUp className="w-3 h-3" />
                                    {message.reactions.thumbsUp}
                                  </span>
                                )}
                                {message.reactions.thumbsDown > 0 && (
                                  <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                                    <ThumbsDown className="w-3 h-3" />
                                    {message.reactions.thumbsDown}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 shadow-sm">
                    <AvatarFallback className="bg-gray-800 dark:bg-gray-200 text-white dark:text-black text-xs">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-white dark:bg-gray-900 rounded-xl px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 text-xs">AI is typing...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Panel - Fixed height */}
        <div className="flex-shrink-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
          <div className="p-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="pr-12 text-sm border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 h-9"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="px-4 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-md h-9"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}