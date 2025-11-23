"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react";
import CryptoJS from "crypto-js";
import { toast } from "sonner";

export default function MD5Tool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [isUpperCase, setIsUpperCase] = useState(false);

  const calculateMD5 = (text: string) => {
    if (!text) {
      setResult("");
      return;
    }
    const hash = CryptoJS.MD5(text).toString();
    setResult(hash);
  };

  const getDisplayHash = () => {
    return isUpperCase ? result.toUpperCase() : result;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getDisplayHash());
      setCopied(true);
      toast.success("MD5 值已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
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
            MD5 加密工具
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            快速生成文本的 MD5 哈希值
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
                calculateMD5(e.target.value);
              }}
              placeholder="请输入要计算 MD5 的文本..."
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white min-h-[150px] resize-y"
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

          {/* Result Section */}
          {result && (
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  MD5 哈希值
                </h3>
                <button
                  onClick={() => copyToClipboard()}
                  className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600 transition-colors"
                >
                  {copied ? (
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
                  {getDisplayHash()}
                </code>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>长度: {result.length} 字符</span>
                <span>•</span>
                <span>128 位 (16 字节)</span>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="rounded-xl border bg-green-50 p-6 dark:bg-green-950/20 dark:border-green-900">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-2">
              💡 关于 MD5
            </h3>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-400">
              <li>• MD5 产生 128 位（16 字节）的哈希值，通常表示为 32 位十六进制数</li>
              <li>• MD5 是一种广泛使用的密码散列函数，可以产生固定长度的哈希值</li>
              <li>• ⚠️ MD5 已不再被认为是安全的加密算法，不建议用于安全敏感的场景</li>
              <li>• 适合用于文件校验、数据完整性验证等非安全场景</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
