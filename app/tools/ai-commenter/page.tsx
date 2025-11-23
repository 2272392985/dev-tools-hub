"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Sparkles, Copy, Key, Code2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (快速)" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro (强力)" },
  { value: "gemini-3-pro-preview", label: "Gemini 3 Pro Preview (最新)" },
];

const DEFAULT_API_KEY = "";

export default function AiCommenterTool() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (result) {
      Prism.highlightAll();
    }
  }, [result, language]);

  // Load API key from local storage or use default
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setApiKey(DEFAULT_API_KEY);
    }
  }, []);

  const handleGenerate = async () => {
    if (!code.trim()) {
      toast.error("请输入代码");
      return;
    }

    const keyToUse = apiKey.trim() || DEFAULT_API_KEY;

    // Save API key if it's not the default one
    if (keyToUse !== DEFAULT_API_KEY) {
      localStorage.setItem("gemini_api_key", keyToUse);
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai-commenter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, apiKey: keyToUse, model }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "请求失败");
      }

      setResult(data.result);
      toast.success("注释生成成功！");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "生成失败，请检查 API Key 或网络");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success("代码已复制");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80 sticky top-0 z-10">
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
              <Bot className="h-5 w-5 text-violet-600" />
              AI 代码注释
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <Sparkles className="h-5 w-5 text-violet-500" />
                配置
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key (Gemini)
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                      placeholder="留空使用默认 Key"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Key 仅存储在本地浏览器中。默认提供免费 Key。
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    AI 模型
                  </label>
                  <div className="relative">
                    <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all appearance-none"
                    >
                      {MODELS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    编程语言
                  </label>
                  <div className="relative">
                    <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all appearance-none"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      正在生成...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      开始生成注释
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-6 border border-violet-100 dark:border-violet-800">
              <h3 className="text-sm font-semibold text-violet-900 dark:text-violet-300 mb-2">
                💡 说明
              </h3>
              <ul className="text-sm text-violet-700 dark:text-violet-400 space-y-1 list-disc list-inside">
                <li>支持最新的 Gemini 2.5/3.0 模型</li>
                <li>自动添加 JSDoc/DocString 文档注释</li>
                <li>为复杂逻辑添加行内解释</li>
                <li>保持原有代码逻辑不变</li>
              </ul>
            </div>
          </div>

          {/* Editor Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden flex flex-col h-[400px]">
              <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">原始代码</span>
                <button 
                  onClick={() => setCode("")}
                  className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                >
                  清空
                </button>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-200"
                placeholder={`在此粘贴您的 ${language} 代码...`}
              />
            </div>

            {/* Output */}
            {result && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden flex flex-col">
                <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">生成结果</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 font-medium"
                  >
                    <Copy className="h-3 w-3" />
                    复制结果
                  </button>
                </div>
                <div className="relative">
                  <pre className="!m-0 !p-4 !bg-transparent !text-sm overflow-auto max-h-[500px]">
                    <code className={`language-${language}`}>
                      {result}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
