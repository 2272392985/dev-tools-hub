"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Copy, Settings2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css"; // Default dark theme
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-go";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-markdown";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "bash", label: "Bash" },
  { value: "sql", label: "SQL" },
  { value: "markdown", label: "Markdown" },
];

const BACKGROUNDS = [
  { name: "Gradient 1", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Gradient 2", value: "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)" },
  { name: "Gradient 3", value: "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)" },
  { name: "Gradient 4", value: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)" },
  { name: "Gradient 5", value: "linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)" },
  { name: "Solid Dark", value: "#1f2937" },
  { name: "Solid Light", value: "#f3f4f6" },
  { name: "Transparent", value: "transparent" },
];

export default function CodeToImageTool() {
  const [code, setCode] = useState(`// Write your code here
function helloWorld() {
  console.log("Hello, World!");
}`);
  const [language, setLanguage] = useState("javascript");
  const [background, setBackground] = useState(BACKGROUNDS[0].value);
  const [padding, setPadding] = useState(32);
  const [title, setTitle] = useState("Untitled");
  const [darkMode, setDarkMode] = useState(true);
  
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const handleDownload = async () => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, // Higher resolution
        backgroundColor: null,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `${title || "code-image"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("图片已下载");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("导出失败，请重试");
    }
  };

  const handleCopy = async () => {
    if (!previewRef.current) return;
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: null,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        toast.success("图片已复制到剪贴板");
      });
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("复制失败");
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
              <ImageIcon className="h-5 w-5 text-indigo-500" />
              代码转图片
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-800"
              title="复制图片"
            >
              <Copy className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">导出图片</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <Settings2 className="h-5 w-5" />
                配置选项
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    语言
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 border"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    背景风格
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {BACKGROUNDS.map((bg, index) => (
                      <button
                        key={index}
                        onClick={() => setBackground(bg.value)}
                        className={`h-8 w-full rounded-md border-2 transition-all ${
                          background === bg.value ? "border-indigo-500 scale-110" : "border-transparent hover:border-gray-300"
                        }`}
                        style={{ background: bg.value }}
                        title={bg.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    内边距: {padding}px
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="128"
                    step="16"
                    value={padding}
                    onChange={(e) => setPadding(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    暗色模式代码
                  </label>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-11 h-6 flex items-center rounded-full transition-colors ${
                      darkMode ? "bg-indigo-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 bg-white rounded-full transform transition-transform ml-1 ${
                        darkMode ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                代码输入
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 p-3 font-mono text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white border focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="在此粘贴您的代码..."
              />
            </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 overflow-auto max-h-[calc(100vh-8rem)] rounded-xl border dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50 p-4 flex items-center justify-center min-h-[500px]">
              <div
                ref={previewRef}
                className="transition-all duration-300 ease-in-out"
                style={{
                  background: background,
                  padding: `${padding}px`,
                  borderRadius: "12px",
                  minWidth: "400px",
                }}
              >
                <div
                  className={`rounded-lg overflow-hidden shadow-2xl ${
                    darkMode ? "bg-[#2d2d2d]" : "bg-white"
                  }`}
                >
                  {/* Window Controls */}
                  <div className={`px-4 py-3 flex items-center gap-2 ${
                    darkMode ? "bg-[#2d2d2d]" : "bg-gray-50"
                  }`}>
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`ml-4 bg-transparent text-xs text-center focus:outline-none ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                      placeholder="Untitled"
                    />
                  </div>

                  {/* Code Area */}
                  <div className="relative">
                    <pre
                      className={`!m-0 !p-6 !bg-transparent !text-sm overflow-hidden ${
                        !darkMode ? "!text-gray-800" : ""
                      }`}
                      style={{
                        fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                      }}
                    >
                      <code className={`language-${language}`}>
                        {code}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              预览区域可直接截图或点击上方按钮导出
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
