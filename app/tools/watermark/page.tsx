"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Download, Settings2, LayoutGrid, Move } from "lucide-react";
import { toast } from "sonner";

export default function WatermarkTool() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [watermarkText, setWatermarkText] = useState("DevTools Hub");
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(0.5);
  const [rotation, setRotation] = useState(-30);
  const [gap, setGap] = useState(100);
  const [mode, setMode] = useState<"single" | "tiled">("tiled");
  const [position, setPosition] = useState<"center" | "tl" | "tr" | "bl" | "br">("center");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Configure text style
      ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      if (mode === "tiled") {
        // Tiled watermark
        const textMetrics = ctx.measureText(watermarkText);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        
        // Calculate diagonal size to cover rotation
        const diag = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
        
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-diag, -diag);

        for (let y = 0; y < diag * 2; y += textHeight + gap) {
          for (let x = 0; x < diag * 2; x += textWidth + gap) {
            ctx.fillText(watermarkText, x, y);
          }
        }
        ctx.restore();
      } else {
        // Single watermark
        ctx.save();
        let x = canvas.width / 2;
        let y = canvas.height / 2;

        const padding = 40;

        switch (position) {
          case "tl":
            x = padding;
            y = padding;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            break;
          case "tr":
            x = canvas.width - padding;
            y = padding;
            ctx.textAlign = "right";
            ctx.textBaseline = "top";
            break;
          case "bl":
            x = padding;
            y = canvas.height - padding;
            ctx.textAlign = "left";
            ctx.textBaseline = "bottom";
            break;
          case "br":
            x = canvas.width - padding;
            y = canvas.height - padding;
            ctx.textAlign = "right";
            ctx.textBaseline = "bottom";
            break;
          case "center":
          default:
            break;
        }

        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillText(watermarkText, 0, 0);
        ctx.restore();
      }
    };
    img.src = imageUrl;
  }, [imageUrl, watermarkText, fontSize, color, opacity, rotation, gap, mode, position]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `watermarked_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("图片已下载");
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
              <Settings2 className="h-5 w-5 text-red-500" />
              图片加水印
            </h1>
          </div>
          <button
            onClick={handleDownload}
            disabled={!imageUrl}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">导出图片</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <Settings2 className="h-5 w-5" />
                水印设置
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    水印文字
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 border"
                    placeholder="输入水印文字"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    模式
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMode("tiled")}
                      className={`flex items-center justify-center gap-2 p-2 rounded-lg border transition-all ${
                        mode === "tiled"
                          ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      铺满
                    </button>
                    <button
                      onClick={() => setMode("single")}
                      className={`flex items-center justify-center gap-2 p-2 rounded-lg border transition-all ${
                        mode === "single"
                          ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      <Move className="h-4 w-4" />
                      单点
                    </button>
                  </div>
                </div>

                {mode === "single" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      位置
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["tl", "center", "tr", "bl", "br"].map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setPosition(pos as "center" | "tl" | "tr" | "bl" | "br")}
                          className={`p-2 rounded-lg border text-xs transition-all ${
                            position === pos
                              ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                              : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                          }`}
                        >
                          {pos === "tl" && "左上"}
                          {pos === "tr" && "右上"}
                          {pos === "center" && "居中"}
                          {pos === "bl" && "左下"}
                          {pos === "br" && "右下"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      字体大小: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="200"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      透明度: {Math.round(opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full accent-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      旋转角度: {rotation}°
                    </label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full accent-red-500"
                    />
                  </div>
                  {mode === "tiled" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        间距: {gap}px
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="500"
                        value={gap}
                        onChange={(e) => setGap(Number(e.target.value))}
                        className="w-full accent-red-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    颜色
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-20 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{color}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-2">
            <div 
              ref={containerRef}
              className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800 min-h-[500px] flex flex-col"
            >
              {!imageUrl ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 dark:border-gray-700">
                  <div className="bg-red-50 p-4 rounded-full mb-4 dark:bg-red-900/20">
                    <Upload className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    上传图片开始制作
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-sm">
                    支持 JPG, PNG, WebP 等常见格式。
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    选择图片
                  </button>
                </div>
              ) : (
                <div className="relative flex-1 flex items-center justify-center bg-gray-100/50 dark:bg-gray-900/50 rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto shadow-sm"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg hover:bg-white text-gray-700 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800 transition-all"
                    title="更换图片"
                  >
                    <Upload className="h-4 w-4" />
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
        </div>
      </main>
    </div>
  );
}
