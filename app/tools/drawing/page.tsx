"use client";

import Link from "next/link";
import { ArrowLeft, Paintbrush } from "lucide-react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

export default function DrawingPage() {
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80 z-10 flex-none">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">返回</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-pink-500" />
              专业绘图 & 流程图
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
         <Tldraw persistenceKey="drawing-persistence" />
      </main>
    </div>
  );
}
