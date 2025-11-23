"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Copy, Check, Pipette, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ColorInfo {
  hex: string;
  rgb: string;
  r: number;
  g: number;
  b: number;
}

export default function ColorPickerTool() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [currentColor, setCurrentColor] = useState<ColorInfo | null>(null);
  const [hoverColor, setHoverColor] = useState<ColorInfo | null>(null);
  const [history, setHistory] = useState<ColorInfo[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // RGB 转 HEX
  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("").toUpperCase();
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setCurrentColor(null);
    setHoverColor(null);
  };

  // 绘制图片到 Canvas
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 调整 canvas 大小以适应容器，同时保持图片比例
      // 这里简单处理，实际可能需要更复杂的缩放逻辑
      // 为了保证取色准确，我们尽量按原图比例绘制，或者记录缩放比例
      
      // 限制最大宽度，防止过大
      const maxWidth = 800;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // 获取坐标颜色
  const getColorAtPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 获取像素数据
    const pixel = ctx.getImageData(Math.max(0, Math.min(x, canvas.width - 1)), Math.max(0, Math.min(y, canvas.height - 1)), 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];

    return {
      r, g, b,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hex: rgbToHex(r, g, b)
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const color = getColorAtPosition(e);
    if (color) {
      setHoverColor(color);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const color = getColorAtPosition(e);
    if (color) {
      setCurrentColor(color);
      // 添加到历史记录，去重
      setHistory(prev => {
        const newHistory = [color, ...prev.filter(c => c.hex !== color.hex)].slice(0, 10);
        return newHistory;
      });
    }
  };

  const handleMouseLeave = () => {
    setHoverColor(null);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      toast.success(`${type} 已复制`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("复制失败");
    }
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success("历史记录已清空");
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
            图片取色器
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            上传图片，点击任意位置精准提取颜色代码
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Image Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800 min-h-[400px] flex flex-col">
              {!imageUrl ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 dark:border-gray-700">
                  <div className="bg-rose-50 p-4 rounded-full mb-4 dark:bg-rose-900/20">
                    <Upload className="h-8 w-8 text-rose-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    上传图片开始取色
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-sm">
                    支持 JPG, PNG, WebP 等常见格式。图片仅在本地处理，不会上传到服务器。
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    选择图片
                  </button>
                </div>
              ) : (
                <div className="relative flex-1 flex items-center justify-center bg-gray-100/50 dark:bg-gray-900/50 rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    onClick={handleClick}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="max-w-full h-auto cursor-crosshair shadow-sm"
                    style={{ imageRendering: "pixelated" }}
                  />
                  
                  {/* 重新上传按钮 */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg hover:bg-white text-gray-700 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800 transition-all"
                    title="更换图片"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Right Column: Color Info */}
          <div className="space-y-6">
            {/* Current Color Card */}
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Pipette className="h-5 w-5 text-rose-500" />
                当前颜色
              </h3>
              
              <div className="flex gap-4 mb-6">
                <div 
                  className="w-24 h-24 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700 transition-colors duration-100"
                  style={{ backgroundColor: (hoverColor || currentColor)?.hex || "#FFFFFF" }}
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">HEX</label>
                    <button
                      onClick={() => copyToClipboard((hoverColor || currentColor)?.hex || "", "HEX")}
                      className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors group"
                      disabled={!hoverColor && !currentColor}
                    >
                      <span className="font-mono text-gray-900 dark:text-white">
                        {(hoverColor || currentColor)?.hex || "---"}
                      </span>
                      {copied === (hoverColor || currentColor)?.hex ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400 group-hover:text-rose-500" />
                      )}
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">RGB</label>
                    <button
                      onClick={() => copyToClipboard((hoverColor || currentColor)?.rgb || "", "RGB")}
                      className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors group"
                      disabled={!hoverColor && !currentColor}
                    >
                      <span className="font-mono text-gray-900 dark:text-white text-sm">
                        {(hoverColor || currentColor)?.rgb || "---"}
                      </span>
                      {copied === (hoverColor || currentColor)?.rgb ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400 group-hover:text-rose-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {!currentColor && !hoverColor && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  移动鼠标预览，点击锁定颜色
                </p>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    历史记录
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    清空
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {history.map((color, index) => (
                    <button
                      key={`${color.hex}-${index}`}
                      onClick={() => setCurrentColor(color)}
                      className="group relative aspect-square rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:ring-2 hover:ring-rose-500 transition-all"
                      style={{ backgroundColor: color.hex }}
                      title={color.hex}
                    >
                      <span className="sr-only">{color.hex}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="rounded-xl border bg-rose-50 p-6 dark:bg-rose-950/20 dark:border-rose-900">
              <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-300 mb-2">
                💡 使用技巧
              </h3>
              <ul className="space-y-2 text-sm text-rose-800 dark:text-rose-400">
                <li>• 点击图片任意位置锁定颜色</li>
                <li>• 移动鼠标可实时预览颜色值</li>
                <li>• 点击颜色代码可直接复制</li>
                <li>• 历史记录保存最近 10 个颜色</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
