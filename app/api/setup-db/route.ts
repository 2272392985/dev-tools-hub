import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Create Tools table
    await sql`
      CREATE TABLE IF NOT EXISTS tools (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(255),
        href VARCHAR(255),
        color VARCHAR(50),
        category VARCHAR(50),
        is_visible BOOLEAN DEFAULT true
      );
    `;

    // Create Links table
    await sql`
      CREATE TABLE IF NOT EXISTS links (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        icon VARCHAR(255),
        description TEXT,
        category VARCHAR(50)
      );
    `;

    // Create API Configs table
    await sql`
      CREATE TABLE IF NOT EXISTS api_configs (
        id VARCHAR(255) PRIMARY KEY,
        service VARCHAR(50) NOT NULL,
        api_key TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true
      );
    `;

    // Check if tools table is empty
    const { rows: toolsRows } = await sql`SELECT COUNT(*) FROM tools`;
    if (toolsRows[0].count === '0') {
      // Insert initial tools data
      const initialTools = [
        {
          "id": "hash",
          "title": "哈希值计算",
          "description": "支持 SHA-1、SHA-256、SHA-512 等多种哈希算法",
          "icon": "Hash",
          "href": "/tools/hash",
          "color": "bg-blue-500",
          "category": "dev",
          "isVisible": true
        },
        {
          "id": "md5",
          "title": "MD5 加密",
          "description": "快速生成文本的 MD5 哈希值",
          "icon": "Lock",
          "href": "/tools/md5",
          "color": "bg-green-500",
          "category": "dev",
          "isVisible": true
        },
        {
          "id": "word-count",
          "title": "字数统计",
          "description": "统计字符数、单词数、行数等信息",
          "icon": "Type",
          "href": "/tools/word-count",
          "color": "bg-purple-500",
          "category": "dev",
          "isVisible": true
        },
        {
          "id": "ip-lookup",
          "title": "IP 地址查询",
          "description": "查询 IPv4/IPv6 地址的地理位置和相关信息",
          "icon": "MapPin",
          "href": "/tools/ip-lookup",
          "color": "bg-orange-500",
          "category": "network",
          "isVisible": true
        },
        {
          "id": "image-tools",
          "title": "图片处理工具",
          "description": "格式转换、尺寸调整、分辨率优化",
          "icon": "ImageIcon",
          "href": "/tools/image-tools",
          "color": "bg-pink-500",
          "category": "image",
          "isVisible": true
        },
        {
          "id": "base-converter",
          "title": "进制转换",
          "description": "二进制、八进制、十进制、十六进制互转",
          "icon": "Binary",
          "href": "/tools/base-converter",
          "color": "bg-cyan-500",
          "category": "dev",
          "isVisible": true
        },
        {
          "id": "color-picker",
          "title": "图片取色器",
          "description": "上传图片，精准提取任意位置的颜色代码",
          "icon": "Pipette",
          "href": "/tools/color-picker",
          "color": "bg-rose-500",
          "category": "image",
          "isVisible": true
        },
        {
          "id": "watermark-remover",
          "title": "图片去水印",
          "description": "涂抹消除水印，支持智能修复、模糊和马赛克",
          "icon": "Eraser",
          "href": "/tools/watermark-remover",
          "color": "bg-teal-500",
          "category": "image",
          "isVisible": true
        },
        {
          "id": "code-to-image",
          "title": "代码转图片",
          "description": "将代码转换为精美的图片，支持多种主题和语言",
          "icon": "Code",
          "href": "/tools/code-to-image",
          "color": "bg-indigo-500",
          "category": "image",
          "isVisible": true
        },
        {
          "id": "watermark",
          "title": "图片加水印",
          "description": "为图片添加文字水印，支持自定义样式和铺满模式",
          "icon": "Stamp",
          "href": "/tools/watermark",
          "color": "bg-red-500",
          "category": "image",
          "isVisible": true
        },
        {
          "id": "markdown-editor",
          "title": "Markdown 编辑器",
          "description": "实时预览的 Markdown 编辑器，支持 GFM 语法",
          "icon": "FileText",
          "href": "/tools/markdown-editor",
          "color": "bg-slate-600",
          "category": "dev",
          "isVisible": true
        },
        {
          "id": "ascii",
          "title": "ASCII 码表",
          "description": "完整的 ASCII 编码对照表，支持多进制查询",
          "icon": "Table",
          "href": "/tools/ascii",
          "color": "bg-amber-500",
          "category": "dev",
          "isVisible": true
        },
        {
          "id": "compiler",
          "title": "在线编译器",
          "description": "支持 Python, Java, C++, Go 等多种语言在线编译运行",
          "icon": "Terminal",
          "href": "/tools/compiler",
          "color": "bg-blue-600",
          "category": "dev",
          "isVisible": true
        },
        {
          "id": "ai-commenter",
          "title": "AI 代码注释",
          "description": "使用 Gemini AI 智能分析代码并生成详细注释",
          "icon": "Bot",
          "href": "/tools/ai-commenter",
          "color": "bg-violet-600",
          "category": "ai",
          "isVisible": true
        },
        {
          "id": "sql-tester",
          "title": "SQL 在线测试",
          "description": "在线运行 SQL 语句，支持 SQLite 语法，实时查看执行结果",
          "icon": "Database",
          "href": "/tools/sql-tester",
          "color": "bg-emerald-600",
          "category": "dev",
          "isVisible": true
        },
        {
          "id": "drawing",
          "title": "在线画板 & 流程图",
          "description": "专业的在线绘图工具，支持流程图、ER图、思维导图等多种图表绘制",
          "icon": "Paintbrush",
          "href": "/tools/drawing",
          "color": "bg-pink-600",
          "category": "image",
          "isVisible": true
        }
      ];

      for (const tool of initialTools) {
        await sql`
          INSERT INTO tools (id, title, description, icon, href, color, category, is_visible)
          VALUES (${tool.id}, ${tool.title}, ${tool.description}, ${tool.icon}, ${tool.href}, ${tool.color}, ${tool.category}, ${tool.isVisible})
        `;
      }
    }

    // Check if links table is empty
    const { rows: linksRows } = await sql`SELECT COUNT(*) FROM links`;
    if (linksRows[0].count === '0') {
      // Insert initial links data
      const initialLinks = [
        {
          "id": "github",
          "title": "GitHub",
          "url": "https://github.com",
          "icon": "Github",
          "description": "全球最大的代码托管平台",
          "category": "general"
        },
        {
          "id": "stackoverflow",
          "title": "Stack Overflow",
          "url": "https://stackoverflow.com",
          "icon": "MessageSquare",
          "description": "开发者问答社区",
          "category": "general"
        },
        {
          "id": "v2ex",
          "title": "V2EX",
          "url": "https://www.v2ex.com",
          "icon": "MessageCircle",
          "description": "创意工作者社区",
          "category": "general"
        },
        {
          "id": "juejin",
          "title": "掘金",
          "url": "https://juejin.cn",
          "icon": "BookOpen",
          "description": "帮助开发者成长的社区",
          "category": "general"
        },
        {
          "id": "openai",
          "title": "ChatGPT",
          "url": "https://chat.openai.com",
          "icon": "Bot",
          "description": "OpenAI 开发的领先 AI 聊天机器人",
          "category": "ai"
        },
        {
          "id": "claude",
          "title": "Claude",
          "url": "https://claude.ai",
          "icon": "Bot",
          "description": "Anthropic 开发的智能助手，擅长长文本分析",
          "category": "ai"
        },
        {
          "id": "deepseek",
          "title": "DeepSeek",
          "url": "https://chat.deepseek.com",
          "icon": "Bot",
          "description": "深度求索开发的开源模型，代码能力强",
          "category": "ai"
        },
        {
          "id": "gemini",
          "title": "Gemini",
          "url": "https://gemini.google.com",
          "icon": "Bot",
          "description": "Google 最强的多模态 AI 模型",
          "category": "ai"
        },
        {
          "id": "midjourney",
          "title": "Midjourney",
          "url": "https://www.midjourney.com",
          "icon": "Image",
          "description": "最强大的 AI 绘画工具之一",
          "category": "ai"
        },
        {
          "id": "huggingface",
          "title": "Hugging Face",
          "url": "https://huggingface.co",
          "icon": "Github",
          "description": "AI 模型的 GitHub，开源模型聚集地",
          "category": "ai"
        },
        {
          "id": "poe",
          "title": "Poe",
          "url": "https://poe.com",
          "icon": "MessageSquare",
          "description": "Quora 推出的 AI 聚合平台",
          "category": "ai"
        },
        {
          "id": "perplexity",
          "title": "Perplexity",
          "url": "https://www.perplexity.ai",
          "icon": "Search",
          "description": "AI 驱动的智能搜索引擎",
          "category": "ai"
        },
        {
          "id": "copilot",
          "title": "Microsoft Copilot",
          "url": "https://copilot.microsoft.com",
          "icon": "Bot",
          "description": "微软推出的 AI 助手，集成 GPT-4",
          "category": "ai"
        },
        {
          "id": "kimi",
          "title": "Kimi 智能助手",
          "url": "https://kimi.moonshot.cn",
          "icon": "Bot",
          "description": "月之暗面开发，支持超长上下文",
          "category": "ai"
        },
        {
          "id": "tongyi",
          "title": "通义千问",
          "url": "https://tongyi.aliyun.com",
          "icon": "Bot",
          "description": "阿里云推出的大语言模型",
          "category": "ai"
        },
        {
          "id": "yiyan",
          "title": "文心一言",
          "url": "https://yiyan.baidu.com",
          "icon": "Bot",
          "description": "百度推出的知识增强大语言模型",
          "category": "ai"
        },
        {
          "id": "hunyuan",
          "title": "腾讯混元",
          "url": "https://hunyuan.tencent.com",
          "icon": "Bot",
          "description": "腾讯研发的大语言模型",
          "category": "ai"
        },
        {
          "id": "doubao",
          "title": "豆包",
          "url": "https://www.doubao.com",
          "icon": "Bot",
          "description": "字节跳动推出的 AI 助手",
          "category": "ai"
        },
        {
          "id": "minimax",
          "title": "海螺 AI",
          "url": "https://hailuoai.com",
          "icon": "Bot",
          "description": "MiniMax 推出的通用人工智能助手",
          "category": "ai"
        },
        {
          "id": "zhipu",
          "title": "智谱清言",
          "url": "https://chatglm.cn",
          "icon": "Bot",
          "description": "智谱 AI 开发的千亿参数对话模型",
          "category": "ai"
        },
        {
          "id": "leonardo",
          "title": "Leonardo.ai",
          "url": "https://leonardo.ai",
          "icon": "Image",
          "description": "高质量的游戏资产和艺术绘画 AI",
          "category": "ai"
        },
        {
          "id": "suno",
          "title": "Suno",
          "url": "https://suno.com",
          "icon": "Music",
          "description": "AI 音乐生成工具",
          "category": "ai"
        },
        {
          "id": "runway",
          "title": "Runway",
          "url": "https://runwayml.com",
          "icon": "Video",
          "description": "专业的 AI 视频生成和编辑工具",
          "category": "ai"
        },
        {
          "id": "civitai",
          "title": "Civitai",
          "url": "https://civitai.com",
          "icon": "Image",
          "description": "Stable Diffusion 模型分享社区",
          "category": "ai"
        },
        {
          "id": "vscode",
          "title": "Visual Studio Code",
          "url": "https://code.visualstudio.com",
          "icon": "Code",
          "description": "最流行的开源代码编辑器",
          "category": "devtools"
        },
        {
          "id": "idea",
          "title": "IntelliJ IDEA",
          "url": "https://www.jetbrains.com/idea",
          "icon": "Code",
          "description": "Java 开发者的首选 IDE",
          "category": "devtools"
        },
        {
          "id": "webstorm",
          "title": "WebStorm",
          "url": "https://www.jetbrains.com/webstorm",
          "icon": "Code",
          "description": "最智能的 JavaScript IDE",
          "category": "devtools"
        },
        {
          "id": "pycharm",
          "title": "PyCharm",
          "url": "https://www.jetbrains.com/pycharm",
          "icon": "Code",
          "description": "Python 专业开发工具",
          "category": "devtools"
        },
        {
          "id": "cursor",
          "title": "Cursor",
          "url": "https://cursor.sh",
          "icon": "Bot",
          "description": "AI 驱动的代码编辑器",
          "category": "devtools"
        },
        {
          "id": "postman",
          "title": "Postman",
          "url": "https://www.postman.com",
          "icon": "Network",
          "description": "API 调试和开发工具",
          "category": "devtools"
        },
        {
          "id": "docker",
          "title": "Docker",
          "url": "https://www.docker.com",
          "icon": "Box",
          "description": "应用容器化引擎",
          "category": "devtools"
        },
        {
          "id": "git",
          "title": "Git",
          "url": "https://git-scm.com",
          "icon": "GitBranch",
          "description": "分布式版本控制系统",
          "category": "devtools"
        },
        {
          "id": "xcode",
          "title": "Xcode",
          "url": "https://developer.apple.com/xcode",
          "icon": "AppWindow",
          "description": "macOS 和 iOS 开发必备",
          "category": "devtools"
        },
        {
          "id": "android-studio",
          "title": "Android Studio",
          "url": "https://developer.android.com/studio",
          "icon": "Smartphone",
          "description": "Android 应用开发官方 IDE",
          "category": "devtools"
        }
      ];

      for (const link of initialLinks) {
        await sql`
          INSERT INTO links (id, title, url, icon, description, category)
          VALUES (${link.id}, ${link.title}, ${link.url}, ${link.icon}, ${link.description}, ${link.category})
        `;
      }
    }

    return NextResponse.json({ message: 'Database tables created and initial data seeded successfully' });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
