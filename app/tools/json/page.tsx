"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Braces, Copy, FileJson, Minimize, Code2 } from "lucide-react";
import { toast } from "sonner";

export default function JsonToolkit() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"format" | "minify" | "ts">("format");

  const handleProcess = () => {
    if (!input.trim()) {
      toast.error("请输入 JSON 内容");
      return;
    }

    try {
      const parsed = JSON.parse(input);

      if (mode === "format") {
        setOutput(JSON.stringify(parsed, null, 2));
        toast.success("格式化成功");
      } else if (mode === "minify") {
        setOutput(JSON.stringify(parsed));
        toast.success("压缩成功");
      } else if (mode === "ts") {
        setOutput(jsonToTs(parsed, "RootObject"));
        toast.success("转换成功");
      }
    } catch {
      toast.error("无效的 JSON 格式");
    }
  };

  const jsonToTs = (obj: unknown, rootName: string): string => {
    // A very basic implementation. For complex objects, libraries are better.
    // Here we just generate a single interface for the root object if it's an object.
    if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
       const lines = [`interface ${rootName} {`];
       for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
         let type: string = typeof val;
         if (val === null) type = "any";
         else if (Array.isArray(val)) {
            if (val.length > 0) {
                const first = val[0];
                if (typeof first === 'object' && first !== null) {
                    type = "any[]"; // Deep nesting not supported in this simple version
                } else {
                    type = `${typeof first}[]`;
                }
            } else {
                type = "any[]";
            }
         } else if (typeof val === 'object') {
             type = "any"; // Deep nesting not supported
         }
         lines.push(`  ${key}: ${type};`);
       }
       lines.push("}");
       return lines.join("\n");
    }
    return "type Root = " + typeof obj;
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
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
              <Braces className="h-5 w-5 text-orange-500" />
              JSON 超级工具箱
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Input */}
          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 flex flex-col flex-1 overflow-hidden">
              <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">输入 JSON</span>
                <div className="flex gap-2">
                  <button onClick={() => setInput("")} className="text-xs text-gray-500 hover:text-red-500">清空</button>
                  <button onClick={() => {
                    navigator.clipboard.readText().then(text => setInput(text));
                  }} className="text-xs text-blue-500 hover:text-blue-600">粘贴</button>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-200"
                placeholder='{"key": "value"}'
              />
            </div>
          </div>

          {/* Controls & Output */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => { setMode("format"); setTimeout(handleProcess, 0); }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${mode === "format" ? "bg-orange-500 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700"}`}
              >
                <FileJson className="h-4 w-4" /> 格式化
              </button>
              <button
                onClick={() => { setMode("minify"); setTimeout(handleProcess, 0); }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${mode === "minify" ? "bg-orange-500 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700"}`}
              >
                <Minimize className="h-4 w-4" /> 压缩
              </button>
              <button
                onClick={() => { setMode("ts"); setTimeout(handleProcess, 0); }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${mode === "ts" ? "bg-orange-500 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700"}`}
              >
                <Code2 className="h-4 w-4" /> 转 TypeScript
              </button>
            </div>

            <button onClick={handleProcess} className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:opacity-90 transition-opacity">
              执行处理
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 flex flex-col flex-1 overflow-hidden">
              <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">结果</span>
                <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600">
                  <Copy className="h-3 w-3" /> 复制
                </button>
              </div>
              <textarea
                readOnly
                value={output}
                className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-200"
                placeholder="结果将显示在这里..."
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
