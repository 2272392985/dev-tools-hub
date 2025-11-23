"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutGrid, Network, Cpu, Palette, Bot, Flame, Link as LinkIcon, Code, Server, Search } from "lucide-react";
import { getIcon } from "@/lib/icons";

type Tool = {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  category: "dev" | "image" | "network" | "ai";
  isVisible: boolean;
};

type LinkItem = {
  id: string;
  title: string;
  url: string;
  icon: string;
  description?: string;
  category?: string;
};

const CATEGORIES = [
  { id: "all", label: "全部工具", icon: LayoutGrid },
  { id: "dev", label: "开发计算", icon: Cpu },
  { id: "image", label: "图片处理", icon: Palette },
  { id: "network", label: "网络工具", icon: Network },
  { id: "ai", label: "AI 智能", icon: Bot },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [popularTools, setPopularTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toolsRes, linksRes] = await Promise.all([
          fetch("/api/tools"),
          fetch("/api/links")
        ]);
        
        const fetchedTools: Tool[] = await toolsRes.json();
        const fetchedLinks: LinkItem[] = await linksRes.json();
        
        setTools(fetchedTools || []);
        setLinks(fetchedLinks || []);

        // Load click counts from localStorage
        const clicks = JSON.parse(localStorage.getItem("tool_clicks") || "{}");
        const sorted = Object.entries(clicks)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([id]) => fetchedTools.find((t) => t.id === id))
          .filter(Boolean) as Tool[];

        if (sorted.length > 0) {
          setPopularTools(sorted);
        } else {
          // Default popular tools if no history
          setPopularTools(fetchedTools.filter(t => t.isVisible).slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToolClick = (id: string) => {
    const clicks = JSON.parse(localStorage.getItem("tool_clicks") || "{}");
    clicks[id] = (clicks[id] || 0) + 1;
    localStorage.setItem("tool_clicks", JSON.stringify(clicks));
  };

  const filteredTools = tools.filter(
    (tool) => 
      tool.isVisible && 
      (activeCategory === "all" || tool.category === activeCategory) &&
      (tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filterLinks = (category?: string) => {
    return links.filter(l => 
      (!category ? (!l.category || l.category === 'general') : l.category === category) &&
      (l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  };

  const aiLinks = filterLinks('ai');
  const devtoolsLinks = filterLinks('devtools');
  const backendLinks = filterLinks('backend');
  const generalLinks = filterLinks();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🛠️ 开发工具合集
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                为程序员打造的实用工具集合
                {currentTime && (
                  <span className="ml-3 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-500 dark:text-gray-400">
                    {currentTime.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full max-w-xs hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索工具..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="relative w-full mb-4 md:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
            />
          </div>

          {/* Navigation Bar */}
          <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeCategory === category.id
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Popular Tools Section */}
        {activeCategory === "all" && popularTools.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              热门工具
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {popularTools.map((tool) => {
                const isImage = tool.icon.startsWith("/") || tool.icon.startsWith("http");
                const Icon = !isImage ? getIcon(tool.icon) : null;
                
                return (
                  <Link
                    key={`popular-${tool.id}`}
                    href={tool.href}
                    onClick={() => handleToolClick(tool.id)}
                    className="group relative overflow-hidden rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 dark:bg-gray-950 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`${tool.color} flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm overflow-hidden`}
                      >
                        {isImage ? (
                          <img src={tool.icon} alt={tool.title} className="w-full h-full object-cover" />
                        ) : (
                          Icon && <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* All Tools Grid */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            {CATEGORIES.find(c => c.id === activeCategory)?.icon && (
              <span className="text-gray-500">
                {(() => {
                  const Icon = CATEGORIES.find(c => c.id === activeCategory)?.icon;
                  return Icon ? <Icon className="h-5 w-5" /> : null;
                })()}
              </span>
            )}
            {CATEGORIES.find(c => c.id === activeCategory)?.label}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => {
              const isImage = tool.icon.startsWith("/") || tool.icon.startsWith("http");
              const Icon = !isImage ? getIcon(tool.icon) : null;

              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  onClick={() => handleToolClick(tool.id)}
                  className="group relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-gray-950 dark:border-gray-800"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`${tool.color} flex h-12 w-12 items-center justify-center rounded-lg text-white transition-transform group-hover:scale-110 overflow-hidden`}
                    >
                      {isImage ? (
                        <img src={tool.icon} alt={tool.title} className="w-full h-full object-cover" />
                      ) : (
                        Icon && <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {tool.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all group-hover:w-full" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* AI Applications Section */}
        {(activeCategory === "all" || activeCategory === "ai") && aiLinks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-500" />
              AI 应用推荐
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {aiLinks.map((link) => {
                const isImage = link.icon.startsWith("/") || link.icon.startsWith("http");
                const Icon = !isImage ? getIcon(link.icon) : null;

                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:bg-gray-50 transition-colors dark:bg-gray-950 dark:border-gray-800 dark:hover:bg-gray-900"
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 flex items-center justify-center w-9 h-9 shrink-0">
                      {isImage ? (
                        <img src={link.icon} alt={link.title} className="w-5 h-5 object-contain" />
                      ) : (
                        Icon && <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {link.title}
                      </h3>
                      {link.description && (
                        <p className="text-xs text-gray-500 truncate">{link.description}</p>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Dev Tools Section */}
        {(activeCategory === "all" || activeCategory === "dev") && devtoolsLinks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-600" />
              热门开发工具
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {devtoolsLinks.map((link) => {
                const isImage = link.icon.startsWith("/") || link.icon.startsWith("http");
                const Icon = !isImage ? getIcon(link.icon) : null;

                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:bg-gray-50 transition-colors dark:bg-gray-950 dark:border-gray-800 dark:hover:bg-gray-900"
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 flex items-center justify-center w-9 h-9 shrink-0">
                      {isImage ? (
                        <img src={link.icon} alt={link.title} className="w-5 h-5 object-contain" />
                      ) : (
                        Icon && <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {link.title}
                      </h3>
                      {link.description && (
                        <p className="text-xs text-gray-500 truncate">{link.description}</p>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Backend Tools Section */}
        {(activeCategory === "all" || activeCategory === "dev") && backendLinks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Server className="h-5 w-5 text-green-600" />
              后端开发资源
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {backendLinks.map((link) => {
                const isImage = link.icon.startsWith("/") || link.icon.startsWith("http");
                const Icon = !isImage ? getIcon(link.icon) : null;

                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:bg-gray-50 transition-colors dark:bg-gray-950 dark:border-gray-800 dark:hover:bg-gray-900"
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 flex items-center justify-center w-9 h-9 shrink-0">
                      {isImage ? (
                        <img src={link.icon} alt={link.title} className="w-5 h-5 object-contain" />
                      ) : (
                        Icon && <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {link.title}
                      </h3>
                      {link.description && (
                        <p className="text-xs text-gray-500 truncate">{link.description}</p>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Recommended Links Section */}
        {activeCategory === "all" && generalLinks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-blue-500" />
              推荐站点
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {generalLinks.map((link) => {
                const isImage = link.icon.startsWith("/") || link.icon.startsWith("http");
                const Icon = !isImage ? getIcon(link.icon) : null;

                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:bg-gray-50 transition-colors dark:bg-gray-950 dark:border-gray-800 dark:hover:bg-gray-900"
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 flex items-center justify-center w-9 h-9 shrink-0">
                      {isImage ? (
                        <img src={link.icon} alt={link.title} className="w-5 h-5 object-contain" />
                      ) : (
                        Icon && <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {link.title}
                      </h3>
                      {link.description && (
                        <p className="text-xs text-gray-500 truncate">{link.description}</p>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>© 2025 DevTools Hub. 为开发者打造</p>
      </footer>
    </div>
  );
}
