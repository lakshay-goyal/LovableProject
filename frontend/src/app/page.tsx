"use client";

// import { prisma } from "@repo/db";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconInfoCircle, IconPlus } from "@tabler/icons-react"
import { ArrowUpIcon, Search, PlusIcon, ArrowRight, Shapes } from "lucide-react"
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
import "./globals.css"
import { motion } from "framer-motion"
import { toast } from "sonner";
import ProductsList from "@/components/ProductsList";
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

  function submitHandler() {
    if (!userQuery.trim()) {
      toast.error("Please enter a query");
      return;
    }

    if (isAuthenticated) {
      // Redirect to playground with the query as a URL parameter
      router.push(`/playground?query=${encodeURIComponent(userQuery)}`);
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
    <div>

      {/* <Button variant={"destructive"}>Hello World</Button> */}
      {/* {user?.name ?? "No user added yet"} */}


      <NavigationBar />
      <div className="relative flex h-screen w-full overflow-hidden bg-black/[0.96] antialiased items-center justify-center">
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
          <h1 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-4xl font-bold text-transparent md:text-7xl mb-10">
            Spotlight <br />is the <Cover>warp speed</Cover>
          </h1>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-xl">
              <InputGroup className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md shadow-lg transition-all hover:border-neutral-700 focus-within:border-blue-500">
                <InputGroupTextarea
                  placeholder="Ask, Search or Chat..."
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
        </motion.div>
      </div>

      {/* History */}
      <ProductsList></ProductsList>
    </div>
  );
}
