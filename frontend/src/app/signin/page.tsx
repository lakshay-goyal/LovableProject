"use client"

import { GalleryVerticalEnd } from "lucide-react"
import NavigationBar from "@/components/NavigationBar"
import { LoginForm } from "@/components/login-form"
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function LoginPage() {

  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch //refetch the session
  } = authClient.useSession()

  useEffect(() => {
    if (session) {
      redirect("/dashboard");
    }
  }, [session]);

  return (
    <div>
      <NavigationBar />
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a href="#" className="flex items-center gap-2 self-center font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Lovable
          </a>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
