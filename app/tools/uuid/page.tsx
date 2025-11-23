"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Fingerprint, Copy, RefreshCw, Settings } from "lucide-react";
import { toast } from "sonner";

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);

  const generateUuid = () => {
    const newUuids = [];
    for (let i = 0; i < count; i++) {
      let uuid = crypto.randomUUID();
      if (uppercase) {
        uuid = uuid.toUpperCase();
      }
      if (!hyphens) {
        uuid = uuid.replace(/-/g, "");
      }
      newUuids.push(uuid);
    }
    setUuids(newUuids);
  };

  // Generate on initial load
  useEffect(() => {
    generateUuid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join("\n"));
    toast.success("全部 UUID 已复制");
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
              <Fingerprint className="h-5 w-5 text-purple-500" />
              UUID 生成器
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <Settings className="h-5 w-5" />
                生成选项
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    生成数量: {count}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">大写字母</label>
                  <button
                    onClick={() => setUppercase(!uppercase)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      uppercase ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        uppercase ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">包含连字符 (-)</label>
                  <button
                    onClick={() => setHyphens(!hyphens)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      hyphens ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        hyphens ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                onClick={generateUuid}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                重新生成
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-white">生成结果</span>
                <button
                  onClick={copyAll}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <Copy className="h-4 w-4" />
                  复制全部
                </button>
              </div>
              <div className="divide-y dark:divide-gray-700 max-h-[600px] overflow-auto">
                {uuids.map((uuid, index) => (
                  <div
                    key={index}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors"
                  >
                    <code className="font-mono text-gray-600 dark:text-gray-300 text-sm sm:text-base break-all">
                      {uuid}
                    </code>
                    <button
                      onClick={() => copyToClipboard(uuid)}
                      className="p-2 text-gray-400 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="复制"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}