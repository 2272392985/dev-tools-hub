"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Copy, FileText, Eye, Columns, Maximize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-markdown";

const DEFAULT_MARKDOWN = `# Welcome to Markdown Editor

This is a live editor. Start editing!

## Features

- **Bold** and *Italic* text
- [Links](https://nextjs.org)
- Lists
  - Unordered
  1. Ordered
- Code blocks

\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\`

- Tables

| Feature | Support |
| :--- | :--- |
| Tables | Yes |
| GFM | Yes |

> Blockquotes are also supported.
`;

export default function MarkdownEditorTool() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");

  useEffect(() => {
    Prism.highlightAll();
  }, [markdown, viewMode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success("Markdown 已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `document_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("文件已下载");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
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
              <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              Markdown 编辑器
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mr-2">
              <button
                onClick={() => setViewMode("edit")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "edit"
                    ? "bg-white dark:bg-gray-700 shadow-sm text-slate-900 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                }`}
                title="仅编辑"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "split"
                    ? "bg-white dark:bg-gray-700 shadow-sm text-slate-900 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                }`}
                title="分屏预览"
              >
                <Columns className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "preview"
                    ? "bg-white dark:bg-gray-700 shadow-sm text-slate-900 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                }`}
                title="仅预览"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleCopy}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-800"
              title="复制 Markdown"
            >
              <Copy className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">导出</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <div className="h-full grid gap-6 transition-all duration-300 ease-in-out"
          style={{
            gridTemplateColumns: viewMode === "split" ? "1fr 1fr" : "1fr"
          }}
        >
          {/* Editor */}
          <div className={`h-full flex flex-col ${viewMode === "preview" ? "hidden" : "block"}`}>
            <div className="bg-white dark:bg-gray-800 rounded-t-xl border-b p-3 flex items-center justify-between border dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">编辑区</span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-200 rounded-b-xl border-x border-b dark:border-gray-700"
              placeholder="在此输入 Markdown..."
            />
          </div>

          {/* Preview */}
          <div className={`h-full flex flex-col ${viewMode === "edit" ? "hidden" : "block"}`}>
            <div className="bg-white dark:bg-gray-800 rounded-t-xl border-b p-3 flex items-center justify-between border dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">预览区</span>
            </div>
            <div className="flex-1 w-full p-6 overflow-auto bg-white dark:bg-gray-800 rounded-b-xl border-x border-b dark:border-gray-700">
              <article className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({inline, className, children, ...props}: {inline?: boolean, className?: string, children?: React.ReactNode}) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <pre className={className}>
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </article>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
