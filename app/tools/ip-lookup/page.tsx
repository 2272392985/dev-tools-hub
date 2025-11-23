"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, MapPin, Globe, Clock, Building2 } from "lucide-react";
import { toast } from "sonner";

interface IPInfo {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
}

export default function IPLookupTool() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IPInfo | null>(null);

  // 页面加载时自动查询本机 IP
  useEffect(() => {
    const fetchMyIP = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/ip-lookup");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "查询失败");
        }

        setResult(data);
        setInput(data.ip);
      } catch (error) {
        console.error("自动查询失败:", error);
        // 静默失败，用户仍可手动输入
      } finally {
        setLoading(false);
      }
    };

    fetchMyIP();
  }, []);

  const handleLookup = async () => {
    if (!input.trim()) {
      toast.error("请输入 IP 地址");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/ip-lookup?ip=${encodeURIComponent(input.trim())}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "查询失败");
      }

      setResult(data);
      toast.success("查询成功");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "查询失败，请检查 IP 地址");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLookup();
    }
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
            IP 地址查询
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            查询 IPv4/IPv6 地址的地理位置和相关信息
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-6">
          {/* Input Section */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
            <label
              htmlFor="ip-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              输入 IP 地址
            </label>
            <div className="flex gap-3">
              <input
                id="ip-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入 IP 地址或查看当前 IP..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <button
                onClick={handleLookup}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    查询中
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    查询
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Section */}
          {result && (
            <div className="space-y-4">
              {/* Location Info */}
              <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    地理位置
                  </h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">IP 地址</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {result.ip}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">国家</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {result.country} ({result.countryCode})
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">地区</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {result.region}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">城市</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {result.city || "未知"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">邮政编码</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {result.zip || "未知"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">坐标</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {result.lat.toFixed(4)}, {result.lon.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Info */}
              <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    网络信息
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 dark:text-gray-400">ISP</div>
                      <div className="text-base font-medium text-gray-900 dark:text-white">
                        {result.isp}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 dark:text-gray-400">组织</div>
                      <div className="text-base font-medium text-gray-900 dark:text-white">
                        {result.org}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 dark:text-gray-400">AS 号</div>
                      <div className="text-base font-medium text-gray-900 dark:text-white">
                        {result.as}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 dark:text-gray-400">时区</div>
                      <div className="text-base font-medium text-gray-900 dark:text-white">
                        {result.timezone}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="rounded-xl border bg-orange-50 p-6 dark:bg-orange-950/20 dark:border-orange-900">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300 mb-2">
              💡 使用说明
            </h3>
            <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-400">
              <li>• 页面加载时自动查询并显示本机 IP 地址信息</li>
              <li>• 支持 IPv4 和 IPv6 地址查询</li>
              <li>• IPv4 示例：8.8.8.8（Google DNS）</li>
              <li>• IPv6 示例：2001:4860:4860::8888（Google DNS）</li>
              <li>• 查询结果包括国家、地区、城市、时区、运营商等详细信息</li>
              <li>• 数据来自 ip-api.com，仅供参考</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
