"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";

type AsciiChar = {
  dec: number;
  hex: string;
  oct: string;
  bin: string;
  char: string;
  description: string;
  category: "control" | "printable" | "extended";
};

const generateAsciiTable = (): AsciiChar[] => {
  const table: AsciiChar[] = [];
  
  // Control Characters (0-31)
  const controlChars = [
    "NUL (Null)", "SOH (Start of Header)", "STX (Start of Text)", "ETX (End of Text)",
    "EOT (End of Transmission)", "ENQ (Enquiry)", "ACK (Acknowledge)", "BEL (Bell)",
    "BS (Backspace)", "TAB (Horizontal Tab)", "LF (Line Feed)", "VT (Vertical Tab)",
    "FF (Form Feed)", "CR (Carriage Return)", "SO (Shift Out)", "SI (Shift In)",
    "DLE (Data Link Escape)", "DC1 (Device Control 1)", "DC2 (Device Control 2)", "DC3 (Device Control 3)",
    "DC4 (Device Control 4)", "NAK (Negative Acknowledge)", "SYN (Synchronous Idle)", "ETB (End of Trans. Block)",
    "CAN (Cancel)", "EM (End of Medium)", "SUB (Substitute)", "ESC (Escape)",
    "FS (File Separator)", "GS (Group Separator)", "RS (Record Separator)", "US (Unit Separator)"
  ];

  for (let i = 0; i < 128; i++) {
    let char = String.fromCharCode(i);
    let description = "";
    let category: AsciiChar["category"] = "printable";

    if (i < 32) {
      char = controlChars[i].split(" ")[0];
      description = controlChars[i];
      category = "control";
    } else if (i === 127) {
      char = "DEL";
      description = "DEL (Delete)";
      category = "control";
    } else if (i === 32) {
      char = "Space";
      description = "Space";
    }

    table.push({
      dec: i,
      hex: i.toString(16).toUpperCase().padStart(2, "0"),
      oct: i.toString(8).padStart(3, "0"),
      bin: i.toString(2).padStart(8, "0"),
      char: char,
      description: description,
      category: category,
    });
  }
  return table;
};

const ASCII_DATA = generateAsciiTable();

export default function AsciiTool() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "control" | "printable">("all");

  const filteredData = useMemo(() => {
    return ASCII_DATA.filter((item) => {
      const matchesSearch = 
        item.dec.toString().includes(search) ||
        item.hex.toLowerCase().includes(search.toLowerCase()) ||
        item.oct.includes(search) ||
        item.char.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = 
        filter === "all" || 
        item.category === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`已复制: ${text}`);
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
              <TableIcon className="h-5 w-5 text-amber-500" />
              ASCII 码表
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索字符、代码或描述..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === "all"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilter("printable")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === "printable"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                可打印
              </button>
              <button
                onClick={() => setFilter("control")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === "control"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                控制字符
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3">Decimal</th>
                  <th className="px-6 py-3">Hex</th>
                  <th className="px-6 py-3">Octal</th>
                  <th className="px-6 py-3">Binary</th>
                  <th className="px-6 py-3">Char</th>
                  <th className="px-6 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredData.map((item) => (
                  <tr 
                    key={item.dec}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                  >
                    <td className="px-6 py-3 font-mono text-gray-600 dark:text-gray-300">
                      <button 
                        onClick={() => handleCopy(item.dec.toString())}
                        className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-2"
                        title="点击复制"
                      >
                        {item.dec}
                      </button>
                    </td>
                    <td className="px-6 py-3 font-mono text-gray-600 dark:text-gray-300">
                      <button 
                        onClick={() => handleCopy(item.hex)}
                        className="hover:text-amber-600 dark:hover:text-amber-400"
                        title="点击复制"
                      >
                        0x{item.hex}
                      </button>
                    </td>
                    <td className="px-6 py-3 font-mono text-gray-600 dark:text-gray-300">
                      <button 
                        onClick={() => handleCopy(item.oct)}
                        className="hover:text-amber-600 dark:hover:text-amber-400"
                        title="点击复制"
                      >
                        {item.oct}
                      </button>
                    </td>
                    <td className="px-6 py-3 font-mono text-gray-600 dark:text-gray-300">
                      <button 
                        onClick={() => handleCopy(item.bin)}
                        className="hover:text-amber-600 dark:hover:text-amber-400"
                        title="点击复制"
                      >
                        {item.bin}
                      </button>
                    </td>
                    <td className="px-6 py-3">
                      <div className={`inline-flex items-center justify-center min-w-[2rem] h-8 rounded ${
                        item.category === "control" 
                          ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-xs px-2 font-bold"
                          : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white text-lg font-serif"
                      }`}>
                        {item.char}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400">
                      {item.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredData.length === 0 && (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                未找到匹配的字符
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
