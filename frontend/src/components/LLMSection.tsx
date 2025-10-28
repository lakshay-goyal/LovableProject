import React, { useState, useRef, useEffect } from "react";
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
      // Generate AI response
      generateAIResponse(userQuery);
    }
  }, [userQuery, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const generateAIResponse = async (userMessage: string) => {
    setIsLoading(true);
    setIsTyping(true);
    setAiThinking(true);
    
    // Simulate AI thinking time with typing indicator
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Generate contextual AI responses based on personality
    const responses = [
      "I understand you're asking about that. Let me help you with that topic. Could you provide more specific details about what you'd like to know?",
      "That's an interesting question! Based on what you've shared, I can suggest a few approaches. What specific aspect would you like me to focus on?",
      "Great question! I can see you're working on something related to this. Let me break this down into manageable steps for you.",
      "I'd be happy to help you with that! Could you tell me more about your current setup or what you've tried so far?",
      "That's a common challenge many developers face. Here are some strategies that might work for your situation...",
      "Interesting! I can help you explore different solutions for this. What's your main goal with this project?",
      "I understand what you're looking for. Let me provide some guidance on how to approach this effectively.",
      "That sounds like a great project! I can help you think through the implementation details. What's your timeline like?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Determine if the response should be treated as code
    const isCodeResponse = Math.random() > 0.7; // 30% chance of code response
    const language = isCodeResponse ? 'javascript' : undefined;
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: randomResponse,
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
    setIsLoading(false);
    setIsTyping(false);
    setAiThinking(false);
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
      <div className="w-80 h-screen border-l border-border bg-background flex flex-col">
        <div className="p-0 flex flex-col h-screen">
          {/* Header Panel - Fixed height */}
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-b">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white">AI Assistant</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {aiPersonality === 'helpful' ? '🤝 Helpful Mode' : 
                       aiPersonality === 'technical' ? '⚙️ Technical Mode' : '🎨 Creative Mode'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowSettings(!showSettings)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={clearConversation}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportConversation}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share className="w-4 h-4 mr-2" />
                        Share Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
            </div>
          </div>

          {/* Main Chat Panel - Flexible height */}
          <div className="flex-1 min-h-0 flex flex-col">
              <div className="h-full flex flex-col">
                {/* Settings Panel */}
                {showSettings && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">AI Personality</span>
                        <div className="flex gap-1">
                          {['helpful', 'technical', 'creative'].map((mode) => (
                            <Button
                              key={mode}
                              variant={aiPersonality === mode ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setAiPersonality(mode as any)}
                              className="h-7 text-xs capitalize"
                            >
                              {mode}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Temperature: {aiTemperature[0]}</span>
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
                          <span className="text-sm">Creativity: {aiCreativity[0]}</span>
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

                
                {/* Messages Area */}
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center space-y-4">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                            <Brain className="w-12 h-12 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">Welcome to AI Assistant</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                              Choose a mode and start a conversation
                            </p>
                          </div>
                          <div className="flex gap-2 justify-center">
                            <Badge variant="outline" className="text-xs px-3 py-1">
                              <Lightbulb className="w-3 h-3 mr-1" />
                              Helpful
                            </Badge>
                            <Badge variant="outline" className="text-xs px-3 py-1">
                              <Code className="w-3 h-3 mr-1" />
                              Technical
                            </Badge>
                            <Badge variant="outline" className="text-xs px-3 py-1">
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
                          className={`flex items-start gap-4 ${
                            message.sender === 'user' ? 'flex-row-reverse' : ''
                          }`}
                        >
                          <Avatar className="w-10 h-10 shadow-md">
                            <AvatarFallback className={
                              message.sender === 'user' 
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                                : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                            }>
                              {message.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={`flex-1 max-w-[80%] ${
                            message.sender === 'user' ? 'text-right' : ''
                          }`}>
                            <div className={`rounded-2xl px-5 py-4 text-sm shadow-lg ${
                              message.sender === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-auto'
                                : message.isCode
                                ? 'bg-gray-900 text-gray-100 border border-gray-700 font-mono'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                            }`}>
                              {message.isCode ? (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-700 pb-2">
                                    <div className="flex items-center gap-2">
                                      <Code className="w-3 h-3" />
                                      <span className="font-mono">{message.language || 'code'}</span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                                      onClick={() => copyToClipboard(message.content)}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                                    <code>{message.content}</code>
                                  </pre>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                              )}
                            </div>
                            
                            <div className={`flex items-center gap-3 mt-3 ${
                              message.sender === 'user' ? 'justify-end' : 'justify-start'
                            }`}>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
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
                                        className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
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
                                        className={`h-7 w-7 p-0 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-full ${
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
                                        className="h-7 w-7 p-0 hover:bg-green-100 dark:hover:bg-green-900 rounded-full"
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
                                        className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                                        onClick={() => addReaction(message.id, 'thumbsDown')}
                                      >
                                        <ThumbsDown className="w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Dislike this response</TooltipContent>
                                  </Tooltip>
                                  
                                  {message.reactions && (message.reactions.thumbsUp > 0 || message.reactions.thumbsDown > 0) && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 ml-2">
                                      {message.reactions.thumbsUp > 0 && (
                                        <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                          <ThumbsUp className="w-3 h-3" />
                                          {message.reactions.thumbsUp}
                                        </span>
                                      )}
                                      {message.reactions.thumbsDown > 0 && (
                                        <span className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
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
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10 shadow-md">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                            <Bot className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 text-sm border border-gray-200 dark:border-gray-700 shadow-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                              <span className="text-gray-500 text-sm">AI is typing...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

            {/* Input Panel - Fixed height */}
            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-t">
                <div className="p-4 h-full flex flex-col">
                  {/* Input Area */}
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1 relative">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything..."
                        className="pr-16 text-sm border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 h-12"
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          💬
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsMuted(!isMuted)}
                          className="h-6 w-6 p-0"
                        >
                          {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      size="sm"
                      className="px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg h-12"
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
        </div>
      </div>
    </TooltipProvider>
  )
}