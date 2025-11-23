"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Eraser, Download, RefreshCw, Undo, MousePointer2 } from "lucide-react";
import { toast } from "sonner";

type ToolType = "repair" | "blur" | "pixelate";

export default function WatermarkRemoverTool() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [brushSize, setBrushSize] = useState(20);
  const [toolType, setToolType] = useState<ToolType>("repair");
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => [...prev.slice(-9), imageData]);
    }
  };

  // 初始化 Canvas
  useEffect(() => {
    if (!imageUrl || !canvasRef.current || !containerRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 适应容器宽度
      const containerWidth = containerRef.current?.clientWidth || 800;
      const scale = Math.min(1, containerWidth / img.width);
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 设置显示大小
      canvas.style.width = `${img.width * scale}px`;
      canvas.style.height = `${img.height * scale}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        // Initial save
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([imageData]);
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handleUndo = () => {
    if (history.length <= 1) return;
    
    const newHistory = [...history];
    newHistory.pop(); // 移除当前状态
    const previousState = newHistory[newHistory.length - 1];
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx && previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setHistory([]);
  };

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const processArea = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const size = brushSize;
    const startX = Math.max(0, Math.floor(x - size / 2));
    const startY = Math.max(0, Math.floor(y - size / 2));
    const w = Math.min(ctx.canvas.width - startX, size);
    const h = Math.min(ctx.canvas.height - startY, size);

    if (w <= 0 || h <= 0) return;

    const imageData = ctx.getImageData(startX, startY, w, h);
    const data = imageData.data;

    if (toolType === "pixelate") {
      const pixelSize = 8;
      for (let py = 0; py < h; py += pixelSize) {
        for (let px = 0; px < w; px += pixelSize) {
          const pixelIndex = (py * w + px) * 4;
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];

          for (let ny = 0; ny < pixelSize && py + ny < h; ny++) {
            for (let nx = 0; nx < pixelSize && px + nx < w; nx++) {
              const targetIndex = ((py + ny) * w + (px + nx)) * 4;
              data[targetIndex] = r;
              data[targetIndex + 1] = g;
              data[targetIndex + 2] = b;
            }
          }
        }
      }
    } else if (toolType === "blur") {
      // 简单的高斯模糊近似
      const radius = 2;
      const tempData = new Uint8ClampedArray(data);
      for (let i = 0; i < data.length; i += 4) {
        // 简单的均值模糊
        // 实际应用中可能需要更高效的算法
        // 这里为了性能，仅做简单的像素混合
        if (Math.random() > 0.5) {
           // 随机噪点混合，模拟模糊
           const offset = (Math.floor(Math.random() * radius * 2) - radius) * 4;
           if (i + offset >= 0 && i + offset < data.length) {
             data[i] = (data[i] + tempData[i + offset]) / 2;
             data[i+1] = (data[i+1] + tempData[i + offset + 1]) / 2;
             data[i+2] = (data[i+2] + tempData[i + offset + 2]) / 2;
           }
        }
      }
    } else if (toolType === "repair") {
      // 简单的像素填充：用周围像素填充中心
      // 这是一个非常基础的实现，仅适用于简单背景
      
      // 取边缘颜色平均值
      let r = 0, g = 0, b = 0, count = 0;
      
      // 采样边缘
      for(let i=0; i<w; i++) {
        const idx1 = i * 4; // Top edge
        const idx2 = ((h-1) * w + i) * 4; // Bottom edge
        r += data[idx1] + data[idx2];
        g += data[idx1+1] + data[idx2+1];
        b += data[idx1+2] + data[idx2+2];
        count += 2;
      }
      
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      // 填充
      for (let i = 0; i < data.length; i += 4) {
        // 简单的混合，保留一点原有纹理防止太假
        data[i] = (data[i] * 0.2 + r * 0.8);
        data[i+1] = (data[i+1] * 0.2 + g * 0.8);
        data[i+2] = (data[i+2] * 0.2 + b * 0.8);
      }
    }

    ctx.putImageData(imageData, startX, startY);
  };

  const handleDrawStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getMousePos(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      processArea(ctx, x, y);
    }
  };

  const handleDrawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getMousePos(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      processArea(ctx, x, y);
    }
  };

  const handleDrawEnd = () => {
    setIsDrawing(false);
    saveHistory();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `removed_watermark_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success("图片已下载");
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
            图片去水印
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            涂抹消除水印，支持智能修复、模糊和马赛克
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Image Area */}
          <div className="lg:col-span-2 space-y-6">
            <div 
              ref={containerRef}
              className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800 min-h-[500px] flex flex-col"
            >
              {!imageUrl ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 dark:border-gray-700">
                  <div className="bg-teal-50 p-4 rounded-full mb-4 dark:bg-teal-900/20">
                    <Upload className="h-8 w-8 text-teal-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    上传图片开始处理
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-sm">
                    支持 JPG, PNG, WebP 等常见格式。
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    选择图片
                  </button>
                </div>
              ) : (
                <div className="relative flex-1 flex items-center justify-center bg-gray-100/50 dark:bg-gray-900/50 rounded-lg overflow-hidden select-none">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleDrawStart}
                    onMouseMove={handleDrawMove}
                    onMouseUp={handleDrawEnd}
                    onMouseLeave={handleDrawEnd}
                    onTouchStart={handleDrawStart}
                    onTouchMove={handleDrawMove}
                    onTouchEnd={handleDrawEnd}
                    className="max-w-full h-auto cursor-crosshair shadow-sm touch-none"
                  />
                  
                  {/* 悬浮工具栏 */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={handleUndo}
                      disabled={history.length <= 1}
                      className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg hover:bg-white text-gray-700 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="撤销"
                    >
                      <Undo className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg hover:bg-white text-gray-700 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800 transition-all"
                      title="更换图片"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
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

          {/* Right Column: Tools */}
          <div className="space-y-6">
            {/* Tool Selection */}
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MousePointer2 className="h-5 w-5 text-teal-500" />
                工具选择
              </h3>
              
              <div className="grid gap-3">
                <button
                  onClick={() => setToolType("repair")}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    toolType === "repair"
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-500"
                      : "border-gray-200 hover:border-teal-200 dark:border-gray-700 dark:hover:border-teal-800"
                  }`}
                >
                  <div className={`p-2 rounded-md ${toolType === "repair" ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>
                    <Eraser className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">智能修复</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">尝试用周围像素填充</div>
                  </div>
                </button>

                <button
                  onClick={() => setToolType("blur")}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    toolType === "blur"
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-500"
                      : "border-gray-200 hover:border-teal-200 dark:border-gray-700 dark:hover:border-teal-800"
                  }`}
                >
                  <div className={`p-2 rounded-md ${toolType === "blur" ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>
                    <div className="h-4 w-4 rounded-full bg-current opacity-50 blur-[1px]" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">模糊遮盖</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">模糊化处理水印区域</div>
                  </div>
                </button>

                <button
                  onClick={() => setToolType("pixelate")}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    toolType === "pixelate"
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-500"
                      : "border-gray-200 hover:border-teal-200 dark:border-gray-700 dark:hover:border-teal-800"
                  }`}
                >
                  <div className={`p-2 rounded-md ${toolType === "pixelate" ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>
                    <div className="h-4 w-4 grid grid-cols-2 gap-[1px]">
                      <div className="bg-current opacity-80" />
                      <div className="bg-current opacity-40" />
                      <div className="bg-current opacity-60" />
                      <div className="bg-current opacity-90" />
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">马赛克</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">像素化遮挡敏感信息</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Brush Size */}
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                画笔大小
              </h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>5px</span>
                  <span className="font-medium text-teal-600 dark:text-teal-400">{brushSize}px</span>
                  <span>100px</span>
                </div>
                {/* Preview Brush */}
                <div className="flex justify-center py-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div 
                    className="rounded-full bg-teal-500 opacity-50"
                    style={{ width: brushSize, height: brushSize }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleDownload}
              disabled={!imageUrl}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-500 px-6 py-3 text-white hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Download className="h-5 w-5" />
              下载处理后的图片
            </button>

            {/* Tips */}
            <div className="rounded-xl border bg-teal-50 p-6 dark:bg-teal-950/20 dark:border-teal-900">
              <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-300 mb-2">
                💡 使用技巧
              </h3>
              <ul className="space-y-2 text-sm text-teal-800 dark:text-teal-400">
                <li>• <strong>智能修复：</strong>适合纯色背景上的简单水印</li>
                <li>• <strong>模糊遮盖：</strong>适合背景复杂，仅需模糊文字</li>
                <li>• <strong>马赛克：</strong>适合彻底遮挡敏感信息（如人脸、号码）</li>
                <li>• 使用撤销按钮可以回退上一步操作</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
