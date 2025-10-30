"use client";

import React from "react";
import LLMSection from "@/components/LLMSection";
import { Toaster } from "sonner";
import { useSearchParams } from "next/navigation";

export default function PlaygroundLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const searchParams = useSearchParams();
    const userQuery = searchParams.get('query');

    return (
        <div className="flex h-screen bg-white">
            <LLMSection userQuery={userQuery} />
            <main className="flex-1 flex flex-col bg-white">
                <div className="flex-1">
                    {children}
                </div>
                <Toaster richColors position="top-right" />
            </main>
        </div>
    );
}