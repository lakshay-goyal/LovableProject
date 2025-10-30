import React, { Suspense } from "react";
import { PlaygroundProvider } from "@/contexts/PlaygroundContext";
import "../globals.css";
import { Toaster } from "sonner";
import PlaygroundLayoutClient from "./playground-layout-client";

export default function PlaygroundLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PlaygroundProvider>
            <Suspense fallback={<div>Loading...</div>}>
                <PlaygroundLayoutClient>
                    {children}
                </PlaygroundLayoutClient>
            </Suspense>
        </PlaygroundProvider>
    );
}
