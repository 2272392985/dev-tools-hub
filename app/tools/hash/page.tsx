"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react";
import CryptoJS from "crypto-js";
import { toast } from "sonner";

const algorithms = [
  { value: "SHA1", label: "SHA-1" },
  { value: "SHA256", label: "SHA-256" },
  { value: "SHA512", label: "SHA-512" },
  { value: "SHA3", label: "SHA-3" },
];

export default function HashTool() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [isUpperCase, setIsUpperCase] = useState(false);

  const calculateHashes = (text: string) => {
    if (!text) {
      setResults({});
      return;
    }

    const newResults: Record<string, string> = {
      SHA1: CryptoJS.SHA1(text).toString(),
      SHA256: CryptoJS.SHA256(text).toString(),
      SHA512: CryptoJS.SHA512(text).toString(),
      SHA3: CryptoJS.SHA3(text).toString(),
    };

    setResults(newResults);
  };

  const getDisplayHash = (hash: string) => {
    return isUpperCase ? hash.toUpperCase() : hash;
  };

  const copyToClipboard = async (text: string, algorithm: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(algorithm);
      toast.success(`${algorithm} 已复制到剪贴板`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            哈希值计算
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            支持多种哈希算法，一键生成哈希值
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-6">
          {/* Input Section */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
            <label
              htmlFor="input-text"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              输入要加密的文本
            </label>
            <textarea
              id="input-text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                calculateHashes(e.target.value);
              }}
              placeholder="请输入要计算哈希值的文本..."
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white min-h-[150px] resize-y"
            />
            <div className="mt-4 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUpperCase}
                  onChange={(e) => setIsUpperCase(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  转换为大写
                </span>
              </label>
            </div>
          </div>

          {/* Results Section */}
          {Object.keys(results).length > 0 && (
            <div className="space-y-4">
              {algorithms.map((algo) => (
                <div
                  key={algo.value}
                  className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {algo.label}
                    </h3>
                    <button
                      onClick={() =>
                        copyToClipboard(getDisplayHash(results[algo.value]), algo.label)
                      }
                      className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 transition-colors"
                    >
                      {copied === algo.label ? (
                        <>
                          <Check className="h-4 w-4" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          复制
                        </>
                      )}
                    </button>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                    <code className="break-all text-sm text-gray-800 dark:text-gray-200 font-mono">
                      {getDisplayHash(results[algo.value])}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Section */}
          <div className="rounded-xl border bg-blue-50 p-6 dark:bg-blue-950/20 dark:border-blue-900">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              💡 关于哈希算法
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
              <li>• SHA-1: 产生 160 位（20 字节）哈希值，已不推荐用于安全用途</li>
              <li>• SHA-256: 产生 256 位（32 字节）哈希值，安全性较高</li>
              <li>• SHA-512: 产生 512 位（64 字节）哈希值，安全性最高</li>
              <li>• SHA-3: 最新的哈希标准，具有不同的安全特性</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
