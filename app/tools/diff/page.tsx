"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, FileDiff, RotateCcw } from "lucide-react";
import * as Diff from "diff";

export default function DiffViewer() {
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");

  const diff = useMemo(() => {
    if (!oldText && !newText) return [];
    return Diff.diffLines(oldText, newText);
  }, [oldText, newText]);

  const handleClear = () => {
    setOldText("");
    setNewText("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">返回</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileDiff className="h-5 w-5 text-orange-500" />
              文本对比工具
            </h1>
          </div>
          <button
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-1"
          >
            <RotateCcw className="h-4 w-4" />
            清空
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          {/* Old Text */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">原始文本</label>
            <textarea
              value={oldText}
              onChange={(e) => setOldText(e.target.value)}
              className="w-full h-64 p-4 font-mono text-sm rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              placeholder="在此输入原始文本..."
            />
          </div>

          {/* New Text */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">新文本</label>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="w-full h-64 p-4 font-mono text-sm rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              placeholder="在此输入修改后的文本..."
            />
          </div>
        </div>

        {/* Diff Output */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
          <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">对比结果</span>
          </div>
          <div className="p-4 font-mono text-sm overflow-auto max-h-[600px] whitespace-pre-wrap">
            {diff.length === 0 ? (
              <span className="text-gray-400 italic">输入文本以查看差异...</span>
            ) : (
              diff.map((part, index) => {
                const color = part.added
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                  : part.removed
                  ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                  : "text-gray-800 dark:text-gray-300";
                
                return (
                  <span key={index} className={`${color} block`}>
                    {part.added ? "+ " : part.removed ? "- " : "  "}
                    {part.value}
                  </span>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}