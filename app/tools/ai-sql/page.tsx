"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Database, Sparkles, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AiSqlGenerator() {
  const [prompt, setPrompt] = useState("");
  const [schema, setSchema] = useState("");
  const [sql, setSql] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("请输入需求描述");
      return;
    }

    setLoading(true);
    setSql("");
    setExplanation("");

    try {
      const response = await fetch("/api/ai-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, schema }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生成失败");
      }

      setSql(data.sql);
      setExplanation(data.explanation);
      toast.success("SQL 生成成功");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
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
              <Database className="h-5 w-5 text-indigo-500" />
              AI SQL 生成器
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  需求描述
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-32 p-4 font-mono text-sm rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="例如：查询过去30天内销售额最高的前10名用户，包含用户名和总金额..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  表结构 (可选)
                </label>
                <textarea
                  value={schema}
                  onChange={(e) => setSchema(e.target.value)}
                  className="w-full h-32 p-4 font-mono text-sm rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="CREATE TABLE users (id INT, name VARCHAR...);&#10;CREATE TABLE orders (id INT, user_id INT, amount DECIMAL...);"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  提供表结构可以生成更准确的 SQL。
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    正在生成...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    生成 SQL
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden flex flex-col h-full min-h-[400px]">
              <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-white">生成结果</span>
                {sql && (
                  <button
                    onClick={() => copyToClipboard(sql)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    复制 SQL
                  </button>
                )}
              </div>
              
              <div className="flex-1 p-6 overflow-auto">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p>AI 正在思考...</p>
                  </div>
                ) : sql ? (
                  <div className="space-y-6">
                    <div className="relative group">
                      <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm overflow-x-auto">
                        {sql}
                      </pre>
                    </div>
                    
                    {explanation && (
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                        <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" /> 解析
                        </h4>
                        <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">
                          {explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Database className="h-12 w-12 opacity-20" />
                    <p>输入描述并点击生成</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}