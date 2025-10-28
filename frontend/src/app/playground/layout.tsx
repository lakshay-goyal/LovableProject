"use client";

import React from "react";
import LLMSection from "@/components/LLMSection";
import "../globals.css";
import { Toaster } from "sonner";
import { useSearchParams } from "next/navigation";

export default function PlaygroundLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const searchParams = useSearchParams();
    const userQuery = searchParams.get('query');

    return (
        <div className="flex h-screen bg-white">
            {/* Left Panel - AI Assistant/Chatbot Sidebar */}
            <LLMSection userQuery={userQuery} />
            
            {/* Right Panel - Main Content Area */}
            <main className="flex-1 flex flex-col bg-white">
                {children}
                <Toaster richColors position="top-right" />
            </main>
        </div>
    );
}
