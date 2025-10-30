"use client";

import React, { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import PlaygroundContent from "./playground-content";

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Spinner className="w-8 h-8" /></div>}>
      <PlaygroundContent />
    </Suspense>
  );
}
