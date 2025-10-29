"use client";

import React from "react";
import LLMSection from "@/components/LLMSection";
import { PlaygroundProvider } from "@/contexts/PlaygroundContext";
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
        <PlaygroundProvider>
            <div className="flex h-screen bg-white">
                <LLMSection userQuery={userQuery} />
                <main className="flex-1 flex flex-col bg-white">
                    <div className="flex-1">
                        {children}
                    </div>
                    <Toaster richColors position="top-right" />
                </main>
            </div>
        </PlaygroundProvider>
    );
}
