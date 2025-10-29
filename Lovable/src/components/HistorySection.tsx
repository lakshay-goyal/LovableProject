"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Eye,
  EyeOff,
  Calendar,
  MessageSquare,
  Play,
  FolderOpen,
  Search,
  Grid3X3,
  List,
  ExternalLink,
  Code,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;
  chatHistories: Array<{
    id: string;
    from: "USER" | "ASSISTANT";
    content?: string;
    createdAt: string;
  }>;
}

interface HistorySectionProps {
  isAuthenticated: boolean;
}

export default function HistorySection({ isAuthenticated }: HistorySectionProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterVisibility, setFilterVisibility] = useState<"all" | "public" | "private">("all");

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error("Failed to load projects");
      setProjects(data.projects || []);
    } catch (err) {
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    const initialQuery = project.chatHistories?.[0]?.content || project.title;
    router.push(`/playground?query=${encodeURIComponent(initialQuery)}&projectId=${project.id}`);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const getInitialQuery = (p: Project) => p.chatHistories?.[0]?.content || p.title;

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getInitialQuery(p).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility =
      filterVisibility === "all" || p.visibility === filterVisibility.toUpperCase();
    return matchesSearch && matchesVisibility;
  });

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
        <Card className="max-w-md text-center shadow-none border border-slate-200">
          <CardContent className="pt-10 pb-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderOpen className="h-10 w-10 text-slate-400" />
                </EmptyMedia>
                <EmptyTitle className="text-lg font-semibold">
                  Sign in to view your project history
                </EmptyTitle>
                <EmptyDescription className="text-sm text-slate-500">
                  Access your previous projects and continue where you left off.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => router.push("/signin")} className="mt-4">
                  Sign In
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Project History</h1>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <ScrollArea className="h-[600px] pr-2">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-5 border-slate-200">
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-3 w-1/2 mb-2" />
                  <Skeleton className="h-20 w-full rounded-md" />
                </Card>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card className="border border-slate-200 text-center py-20">
              <Empty>
                <EmptyMedia variant="icon">
                  <FolderOpen className="h-12 w-12 text-slate-400" />
                </EmptyMedia>
                <EmptyTitle className="text-lg font-semibold">
                  {searchQuery ? "No projects found" : "No projects yet"}
                </EmptyTitle>
                <EmptyDescription className="text-slate-500 text-sm">
                  {searchQuery
                    ? "Try adjusting your search or filter criteria."
                    : "Start by creating your first project."}
                </EmptyDescription>
              </Empty>
            </Card>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredProjects.map((p) => (
                <Card
                  key={p.id}
                  onClick={() => handleProjectClick(p)}
                  className={`cursor-pointer border border-slate-200 hover:border-blue-200 transition-all ${
                    viewMode === "list" ? "flex items-center p-5" : "p-5"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Code className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold text-slate-900 truncate">
                        {p.title}
                      </CardTitle>
                      <Badge
                        variant={p.visibility === "PUBLIC" ? "default" : "secondary"}
                        className="text-[11px] mt-1"
                      >
                        {p.visibility === "PUBLIC" ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" /> Public
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" /> Private
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {getInitialQuery(p)}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(p.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{p.chatHistories.length} messages</span>
                    </div>
                  </div>

                  {viewMode === "grid" && (
                    <Button
                      variant="ghost"
                      className="w-full mt-4 bg-slate-50 hover:bg-blue-50"
                    >
                      <Play className="h-4 w-4 mr-2" /> Open Project
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
