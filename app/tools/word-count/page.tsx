"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Stats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  chineseCharacters: number;
  englishWords: number;
  numbers: number;
}

export default function WordCountTool() {
  const [input, setInput] = useState("");

  const stats = useMemo((): Stats => {
    if (!input) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        lines: 0,
        paragraphs: 0,
        chineseCharacters: 0,
        englishWords: 0,
        numbers: 0,
      };
    }

    const characters = input.length;
    const charactersNoSpaces = input.replace(/\s/g, "").length;
    
    // 行数
    const lines = input.split("\n").length;
    
    // 段落数（非空行）
    const paragraphs = input
      .split("\n")
      .filter((line) => line.trim().length > 0).length;
    
    // 中文字符
    const chineseCharacters = (input.match(/[\u4e00-\u9fa5]/g) || []).length;
    
    // 英文单词（连续的字母序列）
    const englishWords = (input.match(/[a-zA-Z]+/g) || []).length;
    
    // 数字
    const numbers = (input.match(/\d/g) || []).length;
    
    // 总单词数（简单分割）
    const words = input
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      paragraphs,
      chineseCharacters,
      englishWords,
      numbers,
    };
  }, [input]);

  const statCards = [
    {
      label: "总字符数",
      value: stats.characters,
      color: "bg-blue-500",
      description: "包含所有字符",
    },
    {
      label: "不含空格",
      value: stats.charactersNoSpaces,
      color: "bg-green-500",
      description: "排除空格的字符数",
    },
    {
      label: "单词数",
      value: stats.words,
      color: "bg-purple-500",
      description: "以空格分隔的单词",
    },
    {
      label: "行数",
      value: stats.lines,
      color: "bg-orange-500",
      description: "总行数",
    },
    {
      label: "段落数",
      value: stats.paragraphs,
      color: "bg-pink-500",
      description: "非空行数",
    },
    {
      label: "中文字符",
      value: stats.chineseCharacters,
      color: "bg-red-500",
      description: "汉字字符数",
    },
    {
      label: "英文单词",
      value: stats.englishWords,
      color: "bg-indigo-500",
      description: "英文单词数",
    },
    {
      label: "数字",
      value: stats.numbers,
      color: "bg-cyan-500",
      description: "数字字符数",
    },
  ];

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
            字数统计工具
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            实时统计字符数、单词数、行数等信息
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Input Section - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800 h-full">
              <label
                htmlFor="input-text"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                输入文本
              </label>
              <textarea
                id="input-text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此粘贴或输入需要统计的文本..."
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white resize-none"
                style={{ height: "calc(100vh - 350px)", minHeight: "400px" }}
              />
            </div>
          </div>

          {/* Stats Section - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-950 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`${stat.color} h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm`}
                    >
                      {stat.value > 9999
                        ? `${Math.floor(stat.value / 1000)}k`
                        : stat.value}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    {stat.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 rounded-xl border bg-purple-50 p-6 dark:bg-purple-950/20 dark:border-purple-900">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">
            💡 统计说明
          </h3>
          <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-400">
            <li>• 总字符数：包括字母、数字、标点符号、空格等所有字符</li>
            <li>• 不含空格：排除所有空白字符（空格、制表符、换行符等）的字符数</li>
            <li>• 单词数：以空格分隔的单元数量</li>
            <li>• 中文字符：仅统计汉字字符（不包括中文标点）</li>
            <li>• 英文单词：连续的英文字母组成的单词数量</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
