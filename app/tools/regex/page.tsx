"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Regex, Sparkles, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RegexAssistant() {
  const [activeTab, setActiveTab] = useState<"test" | "generate">("test");
  
  // Test Mode State
  const [regexPattern, setRegexPattern] = useState("");
  const [regexFlags, setRegexFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [matches, setMatches] = useState<string[]>([]);
  const [error, setError] = useState("");

  // Generate Mode State
  const [requirement, setRequirement] = useState("");
  const [generatedRegex, setGeneratedRegex] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Test Logic
  useEffect(() => {
    if (!regexPattern) {
      setMatches([]);
      setError("");
      return;
    }

    try {
      const regex = new RegExp(regexPattern, regexFlags);
      const found = testString.match(regex);
      setMatches(found || []);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setMatches([]);
    }
  }, [regexPattern, regexFlags, testString]);

  // Generate Logic
  const handleGenerate = async () => {
    if (!requirement.trim()) {
      toast.error("请输入需求描述");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai-regex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement }),
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      setGeneratedRegex(data.result);
      setRegexPattern(data.result); // Auto-fill tester
      toast.success("正则生成成功");
    } catch (e) {
      toast.error((e as Error).message || "生成失败");
    } finally {
      setIsGenerating(false);
    }
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
              <Regex className="h-5 w-5 text-pink-500" />
              正则助手
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Tabs */}
          <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-xl">
            <button
              onClick={() => setActiveTab("test")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "test" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
            >
              在线测试
            </button>
            <button
              onClick={() => setActiveTab("generate")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === "generate" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
            >
              <Sparkles className="h-4 w-4 text-purple-500" />
              AI 生成
            </button>
          </div>

          {/* Generate Panel */}
          {activeTab === "generate" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">描述你的需求</label>
                <textarea
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none resize-none h-32"
                  placeholder="例如：匹配所有以 @example.com 结尾的邮箱地址..."
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                生成正则表达式
              </button>
              {generatedRegex && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500">生成结果</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(generatedRegex);
                        toast.success("已复制");
                      }}
                      className="text-xs text-purple-500 hover:text-purple-600 flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" /> 复制
                    </button>
                  </div>
                  <code className="block font-mono text-sm break-all dark:text-white">{generatedRegex}</code>
                </div>
              )}
            </div>
          )}

          {/* Test Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700 space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">正则表达式</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">/</span>
                  <input
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    className="w-full pl-6 pr-4 py-2 font-mono text-sm rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-pink-500 outline-none"
                    placeholder="例如：[a-z]+"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">/</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">修饰符 (Flags)</label>
                <input
                  value={regexFlags}
                  onChange={(e) => setRegexFlags(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder="g, i, m..."
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                错误: {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">测试文本</label>
              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                className="w-full p-3 font-mono text-sm rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-pink-500 outline-none h-32 resize-y"
                placeholder="在此输入要测试的文本..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                匹配结果 ({matches.length})
              </label>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-4 min-h-[100px] max-h-[300px] overflow-y-auto">
                {matches.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {matches.map((match, i) => (
                      <span key={i} className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded text-sm font-mono">
                        {match}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">无匹配结果</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
