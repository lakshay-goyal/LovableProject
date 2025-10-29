"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shapes } from "lucide-react";

export default function ProductsList() {
  // You can map over an array for scalability (e.g., from API later)
  const items = Array.from({ length: 9 }, (_, i) => ({
    id: i,
    title: "Shadcn UI Blocks",
    description:
      "Explore a collection of Shadcn UI blocks and components, ready to preview and copy.",
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-6">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Explore Shadcn UI Components
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {items.map((item) => (
          <Card
            key={item.id}
            className="max-w-sm mx-auto hover:shadow-lg hover:scale-[1.02] transition-all duration-300 rounded-2xl border border-gray-200 bg-white"
          >
            <CardHeader className="py-4 px-5 flex flex-row items-center gap-3 font-semibold">
              <div className="h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full shadow-sm">
                <Shapes className="h-5 w-5" />
              </div>
              {item.title}
            </CardHeader>

            <CardContent className="mt-1 text-[15px] text-muted-foreground px-5 pb-5">
              <p>{item.description}</p>
              <div className="mt-5 w-full aspect-video bg-muted rounded-xl flex items-center justify-center text-sm text-gray-400">
                Preview Area
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
