# DevTools Hub - AI Coding Assistant Instructions

## 项目概述

DevTools Hub 是一个为程序员打造的开发工具合集网站，提供哈希计算、MD5加密、字数统计、IP查询、图片处理等实用工具。

**技术栈：**
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Shadcn/UI 组件库
- CryptoJS (加密库)

## 项目结构

```
dev-tools-hub/
├── app/
│   ├── page.tsx           # 首页 - 工具导航
│   ├── layout.tsx         # 根布局
│   ├── globals.css        # 全局样式
│   ├── tools/             # 工具页面
│   │   ├── hash/          # 哈希值计算
│   │   ├── md5/           # MD5 加密
│   │   ├── word-count/    # 字数统计
│   │   ├── ip-lookup/     # IP 地址查询
│   │   └── image-tools/   # 图片处理
│   └── api/               # API 路由
│       └── ip-lookup/     # IP 查询 API
├── components/
│   └── ui/                # Shadcn UI 组件
├── lib/
│   └── utils.ts           # 工具函数 (cn)
└── public/                # 静态资源
```

## 开发规范

### 1. 组件模式
- 所有工具页面使用 `"use client"` 客户端组件
- 统一的页面布局：Header（返回首页按钮 + 标题） + Main Content + Info Section
- 使用 Lucide React 图标库
- 统一的配色方案：每个工具有独特的主题色

### 2. 样式规范
- 使用 Tailwind CSS 类名，不写内联样式
- 响应式设计：使用 `sm:`、`lg:` 等前缀
- 深色模式支持：使用 `dark:` 前缀
- 圆角统一使用 `rounded-xl`
- 间距使用 `gap-6`、`p-6` 等标准值

### 3. 交互反馈
- 使用 `sonner` 提供 toast 通知
- 成功操作：`toast.success()`
- 错误提示：`toast.error()`
- 按钮禁用状态使用 `disabled:opacity-50 disabled:cursor-not-allowed`

### 4. 表单处理
- 输入框使用统一的样式类
- 支持键盘事件（如 Enter 触发提交）
- 实时计算/处理用户输入
- 输入验证和错误处理

### 5. API 路由
- 位于 `app/api/` 目录
- 使用 Next.js Route Handlers
- 返回统一的 JSON 格式
- 错误处理返回适当的 HTTP 状态码

## 工具实现要点

### 哈希计算工具 (`/tools/hash`)
- 使用 CryptoJS 计算多种哈希值（SHA-1, SHA-256, SHA-512, SHA-3）
- 实时计算，输入变化即更新
- 每个哈希值独立的复制按钮

### MD5 加密工具 (`/tools/md5`)
- 使用 CryptoJS.MD5() 生成哈希
- 显示哈希值长度和位数信息
- 单一结果展示

### 字数统计工具 (`/tools/word-count`)
- 使用 `useMemo` 优化实时计算
- 统计：总字符数、不含空格、单词数、行数、段落数、中文字符、英文单词、数字
- 响应式布局：左侧文本输入，右侧统计结果

### IP 地址查询 (`/tools/ip-lookup`)
- API 路由调用第三方服务 (ip-api.com)
- IP 格式验证（IPv4）
- 显示地理位置、网络信息
- 支持 Enter 键触发查询

### 图片处理工具 (`/tools/image-tools`)
- 使用 Canvas API 处理图片
- 支持格式转换：PNG, JPEG, WebP
- 尺寸调整：保持宽高比选项
- 质量控制（JPEG/WebP）
- 本地处理，不上传服务器
- 处理完成自动下载

## 常用命令

```bash
npm run dev    # 启动开发服务器 (http://localhost:3000)
npm run build  # 构建生产版本
npm run start  # 启动生产服务器
npm run lint   # 运行 ESLint
```

## 添加新工具的步骤

1. 在 `app/page.tsx` 的 `tools` 数组中添加新工具配置
2. 创建 `app/tools/[tool-name]/page.tsx`
3. 使用统一的页面结构和样式
4. 如需后端 API，创建 `app/api/[tool-name]/route.ts`
5. 根据功能需求安装必要的 npm 包

## 注意事项

- 所有工具页面必须包含返回首页的链接
- 保持一致的视觉风格和交互模式
- 优先使用客户端组件实现实时交互
- 图片处理等敏感操作在客户端完成，保护用户隐私
- API 路由使用缓存策略优化性能
- 使用 TypeScript 确保类型安全
