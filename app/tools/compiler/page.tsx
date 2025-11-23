"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Terminal, Play, Loader2, Code2 } from "lucide-react";
import { toast } from "sonner";

interface Runtime {
  language: string;
  version: string;
  aliases: string[];
}

const POPULAR_LANGUAGES = [
  "python",
  "javascript",
  "typescript",
  "java",
  "c++",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
];

const DEFAULT_CODE: Record<string, string> = {
  python: `print("Hello, World!")`,
  javascript: `console.log("Hello, World!");`,
  typescript: `console.log("Hello, World!");`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  "c++": `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
  rust: `fn main() {
    println!("Hello, World!");
}`,
  php: `<?php
echo "Hello, World!";
`,
  ruby: `puts "Hello, World!"`,
  swift: `print("Hello, World!")`,
};

export default function CompilerPage() {
  const [code, setCode] = useState(DEFAULT_CODE["python"]);
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("python");
  const [version, setVersion] = useState("");
  const [runtimes, setRuntimes] = useState<Runtime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRuntimesLoading, setIsRuntimesLoading] = useState(true);

  useEffect(() => {
    const fetchRuntimes = async () => {
      try {
        const response = await fetch("https://emkc.org/api/v2/piston/runtimes");
        const data: Runtime[] = await response.json();
        
        // Filter and sort runtimes
        const filtered = data.filter(r => POPULAR_LANGUAGES.includes(r.language));
        
        // Deduplicate runtimes (keep first occurrence of each language)
        const uniqueMap = new Map();
        filtered.forEach(r => {
          if (!uniqueMap.has(r.language)) {
            uniqueMap.set(r.language, r);
          }
        });
        const uniqueRuntimes = Array.from(uniqueMap.values()) as Runtime[];

        // Sort by popular languages order
        uniqueRuntimes.sort((a, b) => {
          return POPULAR_LANGUAGES.indexOf(a.language) - POPULAR_LANGUAGES.indexOf(b.language);
        });
        
        setRuntimes(uniqueRuntimes);
        
        // Set initial version for python
        const pythonRuntime = uniqueRuntimes.find(r => r.language === "python");
        if (pythonRuntime) {
          setVersion(pythonRuntime.version);
        }
      } catch (error) {
        console.error("Failed to fetch runtimes:", error);
        toast.error("无法加载编程语言列表");
      } finally {
        setIsRuntimesLoading(false);
      }
    };

    fetchRuntimes();
  }, []);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    const runtime = runtimes.find(r => r.language === newLang);
    if (runtime) {
      setVersion(runtime.version);
    }
    // Only set default code if the editor is empty or has other default code
    // For simplicity, we'll just set it if it matches one of our defaults
    const isDefault = Object.values(DEFAULT_CODE).includes(code);
    if (isDefault || !code.trim()) {
      setCode(DEFAULT_CODE[newLang] || "");
    }
  };

  const runCode = async () => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    setOutput("");

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: language,
          version: version,
          files: [
            {
              content: code,
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.run) {
        const outputText = data.run.output || "";
        const errorText = data.run.stderr || ""; // Sometimes stderr is separate
        // Piston usually puts everything in output, but let's be safe
        setOutput(outputText);
        
        if (data.run.code !== 0) {
           // Execution failed (non-zero exit code)
           // toast.error("代码执行出错");
        }
      } else {
        setOutput("Error: No output returned from server.");
      }
    } catch (error) {
      console.error("Execution error:", error);
      toast.error("代码执行失败，请稍后重试");
      setOutput("Error: Failed to execute code.");
    } finally {
      setIsLoading(false);
    }
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
              <Terminal className="h-5 w-5 text-blue-600" />
              在线代码编译器
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-6">
          {/* Editor Section */}
          <div className="lg:col-span-2 flex flex-col gap-4 h-full">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 flex flex-col h-full overflow-hidden">
              <div className="py-3 px-4 border-b border-gray-100 dark:border-gray-700 flex flex-row items-center justify-between bg-white dark:bg-gray-800">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 relative">
                    <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select 
                      value={language} 
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      disabled={isRuntimesLoading}
                      className="pl-9 pr-8 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none min-w-[140px]"
                    >
                      {runtimes.map((runtime) => (
                        <option key={runtime.language} value={runtime.language}>
                          {runtime.language} ({runtime.version})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={runCode} 
                  disabled={isLoading || isRuntimesLoading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      运行中...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      运行
                    </>
                  )}
                </button>
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 resize-none focus:outline-none"
                  spellCheck={false}
                  placeholder="在此输入代码..."
                />
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 flex flex-col h-full overflow-hidden">
              <div className="py-3 px-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Terminal className="w-4 h-4" />
                  运行结果
                </h2>
              </div>
              <div className="flex-1 bg-slate-950 p-0 overflow-hidden">
                <div className="w-full h-full p-4 font-mono text-sm text-green-400 overflow-auto whitespace-pre-wrap">
                  {output || <span className="text-slate-600 italic">等待运行...</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
