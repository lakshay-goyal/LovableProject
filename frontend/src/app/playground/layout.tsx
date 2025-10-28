"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import LLMSection from "@/components/LLMSection";
import "../globals.css";
import { Toaster } from "sonner";
import { Geist, Geist_Mono } from "next/font/google";
import { useSearchParams } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function PlaygroundLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const searchParams = useSearchParams();
    const userQuery = searchParams.get('query');

    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <SidebarProvider>
                    <LLMSection userQuery={userQuery} />
                    <main>
                        <SidebarTrigger />
                        {children}
                        <Toaster richColors position="top-right" />
                    </main>
                </SidebarProvider>
            </body>
        </html>
    );
}
