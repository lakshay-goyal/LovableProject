import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import LLMSection from "@/components/LLMSection";
import "../globals.css";
import { Toaster } from "sonner";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <SidebarProvider>
                    <LLMSection/>
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
