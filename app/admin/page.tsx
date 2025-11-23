"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Plus, Trash2, Save, Link as LinkIcon, Upload, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { iconMap, getIcon } from "@/lib/icons";

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  category: string;
  isVisible: boolean;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  description?: string;
  category?: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Pagination & Tabs
  const [activeTab, setActiveTab] = useState<'tools' | 'links'>('tools');
  const [toolsPage, setToolsPage] = useState(1);
  const [linksPage, setLinksPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Simple login check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") { // Hardcoded for demo
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      fetchData();
    } else {
      toast.error("密码错误");
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [toolsRes, linksRes] = await Promise.all([
        fetch("/api/tools"),
        fetch("/api/links")
      ]);
      
      const fetchedTools = await toolsRes.json();
      const fetchedLinks = await linksRes.json();
      
      setTools(fetchedTools);
      setLinks(fetchedLinks);
    } catch (e) {
      console.error(e);
      toast.error("获取数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleToolVisibility = async (id: string) => {
    const newTools = tools.map(t => 
      t.id === id ? { ...t, isVisible: !t.isVisible } : t
    );
    setTools(newTools);
    await saveTools(newTools);
  };

  const saveTools = async (newTools: Tool[]) => {
    try {
      await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTools),
      });
      toast.success("工具状态已更新");
    } catch (e) {
      console.error(e);
      toast.error("保存失败");
    }
  };

  const addLink = () => {
    const newLink: LinkItem = {
      id: Date.now().toString(),
      title: "新链接",
      url: "https://",
      icon: "Globe",
      description: "",
      category: "general"
    };
    setLinks([...links, newLink]);
  };

  const updateLink = (id: string, field: keyof LinkItem, value: string) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const updateTool = (id: string, field: keyof Tool, value: string | boolean) => {
    setTools(tools.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleFileUpload = async (id: string, type: 'tool' | 'link', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        if (type === 'tool') {
          updateTool(id, "icon", data.url);
          // Auto-save tools when icon changes
          const newTools = tools.map(t => t.id === id ? { ...t, icon: data.url } : t);
          await saveTools(newTools);
        } else {
          updateLink(id, "icon", data.url);
        }
        toast.success("图标上传成功");
      } else {
        toast.error("上传失败");
      }
    } catch (error) {
      console.error(error);
      toast.error("上传出错");
    }
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const saveLinksData = async () => {
    try {
      await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(links),
      });
      toast.success("链接已保存");
    } catch (e) {
      console.error(e);
      toast.error("保存失败");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    setPassword("");
  };

  // Pagination Logic
  const totalToolsPages = Math.ceil(tools.length / ITEMS_PER_PAGE);
  const currentTools = tools.slice((toolsPage - 1) * ITEMS_PER_PAGE, toolsPage * ITEMS_PER_PAGE);

  const totalLinksPages = Math.ceil(links.length / ITEMS_PER_PAGE);
  const currentLinks = links.slice((linksPage - 1) * ITEMS_PER_PAGE, linksPage * ITEMS_PER_PAGE);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">后台管理登录</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="请输入管理员密码"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">登录</button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold dark:text-white">后台管理面板</h1>
          <button onClick={handleLogout} className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white transition-colors">退出登录</button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab('tools')}
            className={`pb-2 px-4 font-medium transition-colors relative ${
              activeTab === 'tools' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            工具管理
            {activeTab === 'tools' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`pb-2 px-4 font-medium transition-colors relative ${
              activeTab === 'links' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            外部链接管理
            {activeTab === 'links' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        </div>

        {/* Tool Management */}
        {activeTab === 'tools' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              工具管理
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
              {currentTools.map((tool) => (
                <div key={tool.id} className={`p-4 border rounded-lg flex flex-col gap-3 ${tool.isVisible ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-900 opacity-60'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded flex items-center justify-center text-white overflow-hidden ${tool.color} shrink-0`}>
                        {tool.icon.startsWith("/") || tool.icon.startsWith("http") ? (
                          <img src={tool.icon} alt={tool.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs">{tool.icon.slice(0, 2)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium dark:text-white">{tool.title}</div>
                        <div className="text-xs text-gray-500">{tool.category}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleToolVisibility(tool.id)}
                      className={`p-2 rounded-full ${tool.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-200'}`}
                    >
                      {tool.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <div className="pt-2 border-t flex items-center gap-2">
                    <button 
                      onClick={() => fileInputRefs.current[`tool-${tool.id}`]?.click()}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <Upload className="w-3 h-3" /> 更换图标
                    </button>
                    <input
                      type="file"
                      ref={el => { fileInputRefs.current[`tool-${tool.id}`] = el }}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(tool.id, 'tool', e)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Tools Pagination */}
            {totalToolsPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setToolsPage(p => Math.max(1, p - 1))}
                  disabled={toolsPage === 1}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-5 h-5 dark:text-white" />
                </button>
                <span className="text-sm font-medium dark:text-white">
                  第 {toolsPage} 页 / 共 {totalToolsPages} 页
                </span>
                <button
                  onClick={() => setToolsPage(p => Math.min(totalToolsPages, p + 1))}
                  disabled={toolsPage === totalToolsPages}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-5 h-5 dark:text-white" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Link Management */}
        {activeTab === 'links' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold dark:text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                外部链接管理
              </h2>
              <button onClick={addLink} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                <Plus className="w-4 h-4" /> 添加链接
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              {currentLinks.map((link) => (
                <div key={link.id} className="flex gap-4 items-start p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <div className="grid gap-4 flex-1 md:grid-cols-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">标题</label>
                      <input
                        value={link.title}
                        onChange={(e) => updateLink(link.id, "title", e.target.value)}
                        className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">URL</label>
                      <input
                        value={link.url}
                        onChange={(e) => updateLink(link.id, "url", e.target.value)}
                        className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">分类</label>
                      <select
                        value={link.category || "general"}
                        onChange={(e) => updateLink(link.id, "category", e.target.value)}
                        className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
                      >
                        <option value="general">通用推荐</option>
                        <option value="ai">AI 应用</option>
                        <option value="devtools">开发工具</option>
                        <option value="backend">后端开发</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">图标</label>
                      <div className="flex gap-2 items-center">
                        {link.icon.startsWith("/") || link.icon.startsWith("http") ? (
                          <div className="relative w-9 h-9 border rounded bg-white flex items-center justify-center overflow-hidden shrink-0">
                            <img src={link.icon} alt="icon" className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-9 h-9 border rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 shrink-0">
                            {(() => {
                              const Icon = getIcon(link.icon);
                              return <Icon className="w-5 h-5" />;
                            })()}
                          </div>
                        )}
                        
                        <div className="flex-1 flex flex-col gap-1">
                          <select
                            value={link.icon.startsWith("/") || link.icon.startsWith("http") ? "" : link.icon}
                            onChange={(e) => updateLink(link.id, "icon", e.target.value)}
                            className="w-full p-1.5 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
                          >
                            <option value="" disabled>选择内置图标...</option>
                            {Object.keys(iconMap).map(name => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </select>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => fileInputRefs.current[link.id]?.click()}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                              <Upload className="w-3 h-3" /> 上传图片
                            </button>
                            <input
                              type="file"
                              ref={el => { fileInputRefs.current[link.id] = el }}
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(link.id, 'link', e)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded mt-6"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {links.length === 0 && (
                <div className="text-center text-gray-500 py-8">暂无外部链接</div>
              )}
            </div>
            
            {/* Links Pagination */}
            {totalLinksPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6 mb-6">
                <button
                  onClick={() => setLinksPage(p => Math.max(1, p - 1))}
                  disabled={linksPage === 1}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-5 h-5 dark:text-white" />
                </button>
                <span className="text-sm font-medium dark:text-white">
                  第 {linksPage} 页 / 共 {totalLinksPages} 页
                </span>
                <button
                  onClick={() => setLinksPage(p => Math.min(totalLinksPages, p + 1))}
                  disabled={linksPage === totalLinksPages}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-5 h-5 dark:text-white" />
                </button>
              </div>
            )}
            
            {links.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button onClick={saveLinksData} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Save className="w-4 h-4" /> 保存链接配置
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
