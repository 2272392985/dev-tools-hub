"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, AlertTriangle, Clock, Copy } from "lucide-react";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

export default function JwtDecoder() {
  const [token, setToken] = useState("");
  const [now, setNow] = useState(0);

  // Update time on mount and every minute to keep expiration status fresh
  useEffect(() => {
    // Use setTimeout to avoid synchronous state update warning during mount
    const timer = setTimeout(() => setNow(Date.now()), 0);
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const decoded = useMemo(() => {
    if (!token.trim()) {
      return { header: null, payload: null, error: "" };
    }

    try {
      const header = jwtDecode(token, { header: true }) as Record<string, unknown>;
      const payload = jwtDecode(token) as Record<string, unknown>;
      return { header, payload, error: "" };
    } catch {
      return { header: null, payload: null, error: "无效的 JWT Token" };
    }
  }, [token]);

  const isExpired = useMemo(() => {
    if (!decoded.payload || !('exp' in decoded.payload)) return false;
    const exp = (decoded.payload as { exp: number }).exp;
    // Use the state 'now' instead of Date.now() directly to keep useMemo pure
    // If now is 0 (initial state), we might want to wait, but false is safe default
    return now > 0 && exp * 1000 < now;
  }, [decoded.payload, now]);

  const { header, payload, error } = decoded;

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
              <ShieldCheck className="h-5 w-5 text-blue-500" />
              JWT 解码器
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Encoded Token</label>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full h-64 p-4 font-mono text-sm rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none break-all"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> 安全提示
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                解码过程完全在本地浏览器进行，您的 Token 不会被发送到任何服务器。
              </p>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-6">
            {error ? (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {error}
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                  <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Header</span>
                  </div>
                  <pre className="p-4 text-sm font-mono text-red-500 bg-white dark:bg-gray-900 overflow-auto max-h-40">
                    {header ? JSON.stringify(header, null, 2) : "// Header will appear here"}
                  </pre>
                </div>

                {/* Payload */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                  <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Payload</span>
                    {payload && (
                      <div className="flex items-center gap-3">
                        {isExpired ? (
                          <span className="text-xs text-red-500 flex items-center gap-1 font-medium">
                            <Clock className="h-3 w-3" /> 已过期
                          </span>
                        ) : (
                          <span className="text-xs text-green-500 flex items-center gap-1 font-medium">
                            <Clock className="h-3 w-3" /> 有效
                          </span>
                        )}
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
                            toast.success("Payload 已复制");
                          }}
                          className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" /> 复制
                        </button>
                      </div>
                    )}
                  </div>
                  <pre className="p-4 text-sm font-mono text-purple-500 bg-white dark:bg-gray-900 overflow-auto max-h-96">
                    {payload ? JSON.stringify(payload, null, 2) : "// Payload will appear here"}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
