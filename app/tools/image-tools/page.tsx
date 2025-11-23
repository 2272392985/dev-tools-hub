"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Download, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

type ConversionFormat = "png" | "jpeg" | "webp";

interface ImageInfo {
  width: number;
  height: number;
  size: number;
  type: string;
}

export default function ImageToolsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [outputFormat, setOutputFormat] = useState<ConversionFormat>("png");
  const [resizeWidth, setResizeWidth] = useState<number>(0);
  const [resizeHeight, setResizeHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [quality, setQuality] = useState(0.9);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // 加载图片信息
    const img = new Image();
    img.onload = () => {
      setImageInfo({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
      });
      setResizeWidth(img.width);
      setResizeHeight(img.height);
    };
    img.src = url;
  };

  const handleWidthChange = (width: number) => {
    setResizeWidth(width);
    if (maintainAspectRatio && imageInfo) {
      const ratio = imageInfo.height / imageInfo.width;
      setResizeHeight(Math.round(width * ratio));
    }
  };

  const handleHeightChange = (height: number) => {
    setResizeHeight(height);
    if (maintainAspectRatio && imageInfo) {
      const ratio = imageInfo.width / imageInfo.height;
      setResizeWidth(Math.round(height * ratio));
    }
  };

  const processImage = async () => {
    if (!selectedFile || !previewUrl || !canvasRef.current) return;

    setProcessing(true);
    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = canvasRef.current;
      canvas.width = resizeWidth;
      canvas.height = resizeHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("无法获取 canvas context");

      ctx.drawImage(img, 0, 0, resizeWidth, resizeHeight);

      // 转换为指定格式
      const mimeType = `image/${outputFormat}`;
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error("图片处理失败");
            return;
          }

          // 下载文件
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `processed_${Date.now()}.${outputFormat}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          toast.success("图片处理完成！");
          setProcessing(false);
        },
        mimeType,
        quality
      );
    } catch (error) {
      console.error(error);
      toast.error("图片处理失败");
      setProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
            图片处理工具
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            格式转换、尺寸调整、质量优化
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload & Preview Section */}
          <div className="space-y-6">
            {/* Upload */}
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                上传图片
              </h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-8 hover:border-pink-500 transition-colors dark:border-gray-700"
              >
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  点击上传图片
                </span>
              </button>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  预览
                </h3>
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden dark:bg-gray-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="w-full h-full object-contain"
                  />
                </div>
                {imageInfo && (
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">尺寸：</span>
                      <span className="text-gray-900 dark:text-white">
                        {imageInfo.width} × {imageInfo.height}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">大小：</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatFileSize(imageInfo.size)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settings Section */}
          <div className="space-y-6">
            {/* Format Conversion */}
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                输出格式
              </h3>
              <div className="flex gap-3">
                {(["png", "jpeg", "webp"] as ConversionFormat[]).map((format) => (
                  <button
                    key={format}
                    onClick={() => setOutputFormat(format)}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      outputFormat === format
                        ? "bg-pink-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Resize */}
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                调整尺寸
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    宽度 (px)
                  </label>
                  <input
                    type="number"
                    value={resizeWidth}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    高度 (px)
                  </label>
                  <input
                    type="number"
                    value={resizeHeight}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    保持宽高比
                  </span>
                </label>
              </div>
            </div>

            {/* Quality */}
            {outputFormat !== "png" && (
              <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  图片质量
                </h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(quality * 100)}%
                  </div>
                </div>
              </div>
            )}

            {/* Process Button */}
            {selectedFile && (
              <button
                onClick={processImage}
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-pink-500 px-6 py-3 text-white hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    处理中
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    处理并下载
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 rounded-xl border bg-pink-50 p-6 dark:bg-pink-950/20 dark:border-pink-900">
          <h3 className="text-lg font-semibold text-pink-900 dark:text-pink-300 mb-2 flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            功能说明
          </h3>
          <ul className="space-y-2 text-sm text-pink-800 dark:text-pink-400">
            <li>• 支持 PNG、JPEG、WebP 格式转换</li>
            <li>• 可自由调整图片尺寸，支持保持宽高比</li>
            <li>• JPEG 和 WebP 格式可调整压缩质量</li>
            <li>• 所有处理均在浏览器本地完成，不会上传到服务器</li>
            <li>• 处理完成后自动下载结果图片</li>
          </ul>
        </div>
      </main>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
