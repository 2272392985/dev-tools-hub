"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type BaseType = "binary" | "octal" | "decimal" | "hexadecimal";

interface BaseInfo {
  label: string;
  base: number;
  placeholder: string;
  pattern: RegExp;
  color: string;
}

const baseConfigs: Record<BaseType, BaseInfo> = {
  binary: {
    label: "二进制 (BIN)",
    base: 2,
    placeholder: "例如：1010",
    pattern: /^[01]+$/,
    color: "bg-cyan-500",
  },
  octal: {
    label: "八进制 (OCT)",
    base: 8,
    placeholder: "例如：12",
    pattern: /^[0-7]+$/,
    color: "bg-blue-500",
  },
  decimal: {
    label: "十进制 (DEC)",
    base: 10,
    placeholder: "例如：10",
    pattern: /^[0-9]+$/,
    color: "bg-green-500",
  },
  hexadecimal: {
    label: "十六进制 (HEX)",
    base: 16,
    placeholder: "例如：A 或 a",
    pattern: /^[0-9a-fA-F]+$/,
    color: "bg-purple-500",
  },
};

export default function BaseConverterTool() {
  const [activeBase, setActiveBase] = useState<BaseType>("decimal");
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<Record<BaseType, string>>({
    binary: "",
    octal: "",
    decimal: "",
    hexadecimal: "",
  });
  const [copied, setCopied] = useState<BaseType | null>(null);

  const convertBase = (value: string, fromBase: BaseType) => {
    if (!value) {
      setResults({
        binary: "",
        octal: "",
        decimal: "",
        hexadecimal: "",
      });
      return;
    }

    const config = baseConfigs[fromBase];
    if (!config.pattern.test(value)) {
      toast.error(`输入格式不正确，请输入有效的${config.label}`);
      return;
    }

    try {
      // 转换为十进制
      const decimalValue = parseInt(value, config.base);

      if (isNaN(decimalValue) || decimalValue < 0) {
        toast.error("转换失败，请检查输入");
        return;
      }

      // 从十进制转换为其他进制
      setResults({
        binary: decimalValue.toString(2),
        octal: decimalValue.toString(8),
        decimal: decimalValue.toString(10),
        hexadecimal: decimalValue.toString(16).toUpperCase(),
      });
    } catch (error) {
      console.error(error);
      toast.error("转换失败，数值可能超出范围");
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value.trim());
    convertBase(value.trim(), activeBase);
  };

  const handleBaseChange = (base: BaseType) => {
    setActiveBase(base);
    setInputValue("");
    setResults({
      binary: "",
      octal: "",
      decimal: "",
      hexadecimal: "",
    });
  };

  const copyToClipboard = async (text: string, base: BaseType) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(base);
      toast.success(`${baseConfigs[base].label} 已复制到剪贴板`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("复制失败");
    }
  };

  const handleClear = () => {
    setInputValue("");
    setResults({
      binary: "",
      octal: "",
      decimal: "",
      hexadecimal: "",
    });
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
            进制转换工具
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            二进制、八进制、十进制、十六进制快速互转
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-6">
          {/* Input Section */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              选择输入进制
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {(Object.keys(baseConfigs) as BaseType[]).map((base) => (
                <button
                  key={base}
                  onClick={() => handleBaseChange(base)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeBase === base
                      ? `${baseConfigs[base].color} text-white`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {baseConfigs[base].label}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={baseConfigs[activeBase].placeholder}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white font-mono"
              />
              {inputValue && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="清空"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          {inputValue && (
            <div className="space-y-4">
              {(Object.keys(baseConfigs) as BaseType[])
                .filter((base) => base !== activeBase)
                .map((base) => {
                  const config = baseConfigs[base];
                  return (
                    <div
                      key={base}
                      className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`${config.color} h-3 w-3 rounded-full`}
                          />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {config.label}
                          </h3>
                        </div>
                        <button
                          onClick={() => copyToClipboard(results[base], base)}
                          className={`flex items-center gap-2 rounded-lg ${config.color} px-4 py-2 text-sm text-white hover:opacity-90 transition-opacity`}
                        >
                          {copied === base ? (
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
                        <code className="break-all text-lg text-gray-800 dark:text-gray-200 font-mono">
                          {results[base] || "0"}
                        </code>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* All Results Summary */}
          {inputValue && (
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                转换结果汇总
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(baseConfigs) as BaseType[]).map((base) => {
                  const config = baseConfigs[base];
                  return (
                    <div
                      key={base}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
                    >
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {config.label}
                      </span>
                      <code className="text-sm font-mono text-gray-900 dark:text-white">
                        {results[base] || "0"}
                      </code>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="rounded-xl border bg-cyan-50 p-6 dark:bg-cyan-950/20 dark:border-cyan-900">
            <h3 className="text-lg font-semibold text-cyan-900 dark:text-cyan-300 mb-2">
              💡 进制说明
            </h3>
            <ul className="space-y-2 text-sm text-cyan-800 dark:text-cyan-400">
              <li>
                • <strong>二进制 (Binary):</strong> 仅使用 0 和 1，计算机底层使用的进制
              </li>
              <li>
                • <strong>八进制 (Octal):</strong> 使用 0-7，常用于 Unix 文件权限
              </li>
              <li>
                • <strong>十进制 (Decimal):</strong> 使用 0-9，日常生活中最常用的进制
              </li>
              <li>
                • <strong>十六进制 (Hexadecimal):</strong> 使用 0-9 和 A-F，常用于颜色代码、内存地址等
              </li>
              <li className="pt-2 border-t border-cyan-200 dark:border-cyan-800">
                提示：选择输入进制后，输入相应格式的数字，其他进制结果会自动显示
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
