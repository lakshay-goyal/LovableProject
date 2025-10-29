"use client";

// import { prisma } from "@repo/db";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconInfoCircle, IconPlus } from "@tabler/icons-react"
import { ArrowUpIcon, Search, PlusIcon, ArrowRight, Shapes, Star, Zap, Shield, Users, Code, Sparkles, ChevronRight, CheckCircle, Play } from "lucide-react"
import { cn } from "../lib/utils"
import { Spotlight } from "@/components/ui/spotlight"
import { Cover } from "@/components/ui/cover"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import "./globals.css"
import { motion } from "framer-motion"
import { toast } from "sonner";
import HistorySection from "@/components/HistorySection";
import NavigationBar from "@/components/NavigationBar";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

export default function Page() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const user = await prisma.user.findFirst()

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  async function submitHandler() {
    if (!userQuery.trim()) {
      toast.error("Please enter a query");
      return;
    }

    if (isAuthenticated) {
      try {
        // Create a new project and get the projectID
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: userQuery,
            title: userQuery.length > 50 ? userQuery.substring(0, 50) + '...' : userQuery,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create project');
        }

        const data = await response.json();
        
        if (data.success && data.project?.id) {
          // Show appropriate message based on whether it's a new or existing project
          if (data.isNewProject) {
            toast.success("New project created successfully!");
          } else {
            toast.success("Returning to existing project");
          }
          
          // Redirect to playground with both query and projectID as URL parameters
          router.push(`/playground?query=${encodeURIComponent(userQuery)}&projectId=${data.project.id}`);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Error creating project:', error);
        toast.error("Failed to create project. Please try again.");
        // Fallback to redirecting with just the query
        router.push(`/playground?query=${encodeURIComponent(userQuery)}`);
      }
    } else {
      // Redirect to signin page
      router.push("/signin");
    }
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen bg-black items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner className="h-8 w-8 text-white" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased">
      <NavigationBar />
      
      {/* Hero Section */}
      <section className="relative flex min-h-screen w-full overflow-hidden items-center justify-center">
        {/* === Animated Background Grid === */}
        <motion.div
          className={cn(
            "pointer-events-none absolute inset-0 select-none [background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]",
          )}
          animate={{
            backgroundPosition: ["0px 0px", "40px 40px"],
          }}
          transition={{
            duration: 8,
            ease: "linear",
            repeat: Infinity,
          }}
        />

        {/* === Spotlight Glow === */}
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60 blur-3xl opacity-70"
          fill="#3b82f6"
        />

        {/* === Animated Floating Light === */}
        <motion.div
          className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
          animate={{
            y: [0, 20, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* === Content === */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 mx-auto w-full max-w-7xl px-4 text-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            className="mb-8"
          >
            <Badge variant="outline" className="mb-6 border-blue-500/50 text-blue-400 bg-blue-500/10">
              <Sparkles className="w-3 h-3 mr-2" />
              AI-Powered Development Platform
            </Badge>
          </motion.div>

          <h1 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-4xl font-bold text-transparent md:text-7xl mb-6">
            Build <Cover>faster</Cover> with AI
          </h1>
          
          <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">
            Transform your ideas into production-ready applications with our intelligent development platform. 
            Code, deploy, and iterate at the speed of thought.
          </p>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="w-full max-w-xl">
              <InputGroup className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md shadow-lg transition-all hover:border-neutral-700 focus-within:border-blue-500">
                <InputGroupTextarea
                  placeholder="Describe your project idea..."
                  className="text-neutral-100 placeholder:text-neutral-500 resize-none"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      submitHandler();
                    }
                  }}
                />
                <InputGroupAddon align="block-end" className="gap-2">
                  <InputGroupButton
                    variant="outline"
                    className="rounded-full hover:bg-neutral-800 hover:text-blue-400 transition-colors"
                    size="icon-xs"
                  >
                    <PlusIcon />
                  </InputGroupButton>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <InputGroupButton variant="ghost" className="text-neutral-400 hover:text-grey-800">
                        Auto
                      </InputGroupButton>
                    </DropdownMenuTrigger>
                    <InputGroupButton variant="ghost" className="text-neutral-400 hover:text-grey-800">
                      Supabase
                    </InputGroupButton>
                    <DropdownMenuContent
                      side="top"
                      align="start"
                      className="[--radius:0.95rem] bg-neutral-900 border-neutral-800 text-white"
                    >
                      <DropdownMenuItem>Auto</DropdownMenuItem>
                      <DropdownMenuItem>Agent</DropdownMenuItem>
                      <DropdownMenuItem>Manual</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <InputGroupText className="ml-auto text-neutral-400">52% used</InputGroupText>
                  <Separator orientation="vertical" className="!h-4 bg-neutral-700" />
                  <InputGroupButton
                    variant="default"
                    className="rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
                    size="icon-xs"
                    onClick={submitHandler}
                  >
                    <ArrowUpIcon className="text-white" />
                    <span className="sr-only">Send</span>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full"
              onClick={submitHandler}
            >
              Start Building
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 px-8 py-3 rounded-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Watch Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section - Only show if not authenticated */}
      {!isAuthenticated && (
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Why choose our platform?
              </h2>
              <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                Powerful features designed to accelerate your development workflow
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="w-8 h-8 text-blue-400" />,
                  title: "Lightning Fast",
                  description: "Generate and deploy applications in minutes, not hours. Our AI understands context and builds intelligently."
                },
                {
                  icon: <Shield className="w-8 h-8 text-green-400" />,
                  title: "Production Ready",
                  description: "Built-in best practices, security, and scalability. Your code is ready for production from day one."
                },
                {
                  icon: <Code className="w-8 h-8 text-purple-400" />,
                  title: "Full Stack",
                  description: "Complete full-stack applications with frontend, backend, database, and deployment all in one platform."
                },
                {
                  icon: <Users className="w-8 h-8 text-orange-400" />,
                  title: "Team Collaboration",
                  description: "Work together seamlessly with real-time collaboration, version control, and shared workspaces."
                },
                {
                  icon: <Sparkles className="w-8 h-8 text-pink-400" />,
                  title: "AI-Powered",
                  description: "Leverage cutting-edge AI to understand requirements, suggest improvements, and automate repetitive tasks."
                },
                {
                  icon: <Star className="w-8 h-8 text-yellow-400" />,
                  title: "Enterprise Grade",
                  description: "Scalable infrastructure with 99.9% uptime, enterprise security, and dedicated support."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 transition-all duration-300 hover:bg-neutral-900/70">
                    <CardHeader>
                      <div className="mb-4">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-neutral-400 text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section - Only show if not authenticated */}
      {!isAuthenticated && (
        <section className="py-16 px-4 bg-neutral-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "10K+", label: "Projects Built" },
                { number: "50K+", label: "Developers" },
                { number: "99.9%", label: "Uptime" },
                { number: "5min", label: "Avg Build Time" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="space-y-2"
                >
                  <div className="text-3xl md:text-4xl font-bold text-white">{stat.number}</div>
                  <div className="text-neutral-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section - Only show if not authenticated */}
      {!isAuthenticated && (
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Loved by developers worldwide
              </h2>
              <p className="text-xl text-neutral-400">
                See what our community is saying
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Chen",
                  role: "Full Stack Developer",
                  avatar: "SC",
                  content: "This platform has revolutionized how I build applications. What used to take weeks now takes hours."
                },
                {
                  name: "Marcus Johnson",
                  role: "Startup Founder",
                  avatar: "MJ",
                  content: "The AI understands exactly what I need. It's like having a senior developer as my pair programming partner."
                },
                {
                  name: "Elena Rodriguez",
                  role: "CTO",
                  avatar: "ER",
                  content: "Our team productivity has increased 300% since we started using this platform. It's a game changer."
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <Avatar className="mr-3">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {testimonial.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-white">{testimonial.name}</div>
                          <div className="text-sm text-neutral-400">{testimonial.role}</div>
                        </div>
                      </div>
                      <p className="text-neutral-300 italic">"{testimonial.content}"</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Only show if not authenticated */}
      {!isAuthenticated && (
        <section className="py-24 px-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to build the future?
              </h2>
              <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
                Join thousands of developers who are already building faster, smarter, and more efficiently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg"
                  onClick={submitHandler}
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 px-8 py-4 rounded-full text-lg"
                >
                  View Documentation
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* History - Always show */}
      <HistorySection isAuthenticated={isAuthenticated} />

      {/* Footer - Only show if not authenticated */}
      {!isAuthenticated && (
        <footer className="bg-neutral-950 border-t border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">AI Platform</span>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  The future of development is here. Build faster, smarter, and more efficiently with AI-powered tools.
                </p>
                <div className="flex space-x-4">
                  <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Product */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Product</h3>
                <ul className="space-y-2">
                  <li><Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto">Features</Button></li>
                  <li><Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto">Pricing</Button></li>
                  <li><Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto">Documentation</Button></li>
                  <li><Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto">API Reference</Button></li>
                  <li><Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto">Changelog</Button></li>
                </ul>
              </div>

              {/* Company */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Company</h3>
                <ul className="space-y-2">
                  <li><Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto">About</Button></li>
                  <li><Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto">Blog</Button></li>
                  <li><Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto">Careers</Button></li>
                  <li><Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto">Press</Button></li>
                  <li><Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto">Partners</Button></li>
                </ul>
              </div>

              {/* Support */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Support</h3>
                <ul className="space-y-2">
                  <li><Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto">Help Center</Button></li>
                  <li><Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto">Community</Button></li>
                  <li><Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto">Contact</Button></li>
                  <li><Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto">Status</Button></li>
                  <li><Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto">Security</Button></li>
                </ul>
              </div>
            </div>

            <Separator className="my-8 bg-neutral-800" />

            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-neutral-400 text-sm">
                © 2024 AI Platform. All rights reserved.
              </div>
              <div className="flex space-x-6">
                <Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto text-sm">Privacy Policy</Button>
                <Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto text-sm">Terms of Service</Button>
                <Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto text-sm">Cookie Policy</Button>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
