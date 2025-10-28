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
  Clock
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
}

interface LLMSectionProps {
  userQuery?: string | null;
}

export default function LLMSection({ userQuery }: LLMSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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
    
    // Simulate AI thinking time with typing indicator
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Generate contextual AI responses
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
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: randomResponse,
      sender: 'ai',
      timestamp: new Date(),
      reactions: {
        thumbsUp: 0,
        thumbsDown: 0
      }
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
    setIsTyping(false);
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

  return (
    <TooltipProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              AI Assistant
              <Badge variant="secondary" className="ml-auto text-xs">
                {messages.length} messages
              </Badge>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <Card className="mx-2 mb-2 h-[calc(100vh-140px)] flex flex-col border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Chat with AI
                  </CardTitle>
                </CardHeader>
                <Separator />
                
                {/* Messages Area */}
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-40">
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                            <Bot className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">Welcome to AI Assistant</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Start a conversation with our AI assistant
                            </p>
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
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={
                              message.sender === 'user' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                            }>
                              {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={`flex-1 max-w-[85%] ${
                            message.sender === 'user' ? 'text-right' : ''
                          }`}>
                            <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                              message.sender === 'user'
                                ? 'bg-blue-500 text-white ml-auto'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border'
                            }`}>
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                            
                            <div className={`flex items-center gap-2 mt-2 ${
                              message.sender === 'user' ? 'justify-end' : 'justify-start'
                            }`}>
                              <div className="flex items-center gap-1 text-xs text-gray-400">
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
                                        className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                                        className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900"
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
                                        className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                                        onClick={() => addReaction(message.id, 'thumbsDown')}
                                      >
                                        <ThumbsDown className="w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Dislike this response</TooltipContent>
                                  </Tooltip>
                                  
                                  {message.reactions && (message.reactions.thumbsUp > 0 || message.reactions.thumbsDown > 0) && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      {message.reactions.thumbsUp > 0 && (
                                        <span className="flex items-center gap-1">
                                          <ThumbsUp className="w-3 h-3" />
                                          {message.reactions.thumbsUp}
                                        </span>
                                      )}
                                      {message.reactions.thumbsDown > 0 && (
                                        <span className="flex items-center gap-1">
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
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 text-sm border">
                            <div className="flex items-center gap-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                              <span className="text-gray-500 text-xs">AI is typing...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <Separator />
                
                {/* Input Area */}
                <div className="p-4">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      className="flex-1 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      size="sm"
                      className="px-4 bg-blue-500 hover:bg-blue-600"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </Card>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  )
}