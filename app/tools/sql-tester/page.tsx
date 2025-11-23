"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Database, Play, Trash2, Table as TableIcon, RotateCcw } from "lucide-react";
import { toast } from "sonner";
// @ts-expect-error alasql types are not resolving correctly
import alasql from "alasql";

export default function SqlTesterTool() {
  const [sql, setSql] = useState("SELECT * FROM users;");
  const [result, setResult] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [error, setError] = useState("");
  const initialized = useRef(false);

  const updateTablesList = useCallback(() => {
    const res = alasql("SHOW TABLES");
    setTables(res.map((t: { tableid: string }) => t.tableid));
  }, []);

  const executeSql = useCallback((query: string) => {
    setError("");
    try {
      const res = alasql(query);
      
      let data = res;
      if (Array.isArray(res) && res.length > 0 && Array.isArray(res[0])) {
         data = res[res.length - 1];
      }

      if (Array.isArray(data)) {
        setResult(data);
        if (data.length > 0) {
          setColumns(Object.keys(data[0]));
        } else {
          setColumns([]);
        }
      } else {
        setResult([]);
        setColumns([]);
        toast.success("执行成功");
      }
      
      updateTablesList();
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "执行出错");
      setResult([]);
      setColumns([]);
    }
  }, [updateTablesList]);

  const initDatabase = useCallback(() => {
    try {
      alasql("CREATE TABLE IF NOT EXISTS users (id INT, name STRING, age INT, role STRING)");
      alasql("DELETE FROM users");
      alasql("INSERT INTO users VALUES (1, 'Alice', 28, 'Admin')");
      alasql("INSERT INTO users VALUES (2, 'Bob', 24, 'Developer')");
      alasql("INSERT INTO users VALUES (3, 'Charlie', 32, 'Designer')");
      alasql("INSERT INTO users VALUES (4, 'David', 29, 'Manager')");
      
      alasql("CREATE TABLE IF NOT EXISTS products (id INT, name STRING, price INT, stock INT)");
      alasql("DELETE FROM products");
      alasql("INSERT INTO products VALUES (101, 'Laptop', 1200, 50)");
      alasql("INSERT INTO products VALUES (102, 'Mouse', 25, 200)");
      alasql("INSERT INTO products VALUES (103, 'Keyboard', 80, 150)");

      updateTablesList();
      executeSql("SELECT * FROM users;");
      toast.success("数据库已重置");
    } catch (e) {
      console.error(e);
      toast.error("初始化失败");
    }
  }, [updateTablesList, executeSql]);

  // Initialize database with sample data
  useEffect(() => {
    if (!initialized.current) {
      setTimeout(() => {
        initDatabase();
      }, 0);
      initialized.current = true;
    }
  }, [initDatabase]);

  const handleTableClick = (tableName: string) => {
    const q = `SELECT * FROM ${tableName};`;
    setSql(q);
    executeSql(q);
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
              <Database className="h-5 w-5 text-emerald-600" />
              SQL 在线测试
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Tables */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold dark:text-white flex items-center gap-2">
                  <TableIcon className="h-4 w-4" />
                  数据表
                </h2>
                <button 
                  onClick={initDatabase}
                  className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-1"
                  title="重置数据库"
                >
                  <RotateCcw className="h-3 w-3" /> 重置
                </button>
              </div>
              <div className="space-y-2">
                {tables.map(table => (
                  <button
                    key={table}
                    onClick={() => handleTableClick(table)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Database className="h-3 w-3 text-gray-400" />
                    {table}
                  </button>
                ))}
                {tables.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-4">暂无数据表</div>
                )}
              </div>
            </div>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
              <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
                💡 提示
              </h3>
              <ul className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1 list-disc list-inside">
                <li>支持标准 SQL 语法</li>
                <li>数据仅在浏览器内存中保存</li>
                <li>刷新页面会重置数据</li>
                <li>支持 CREATE, INSERT, SELECT, DELETE 等操作</li>
              </ul>
            </div>
          </div>

          {/* Main Content - Editor & Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">SQL 编辑器</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSql("")}
                    className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="清空"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => executeSql(sql)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Play className="h-3 w-3" /> 运行
                  </button>
                </div>
              </div>
              <textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                className="w-full h-40 p-4 font-mono text-sm resize-y focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-200"
                placeholder="输入 SQL 语句..."
                spellCheck={false}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-100 dark:border-red-800">
                执行错误: {error}
              </div>
            )}

            {/* Results Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
              <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  执行结果 {result.length > 0 && `(${result.length} 条记录)`}
                </span>
              </div>
              
              <div className="overflow-x-auto">
                {result.length > 0 ? (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        {columns.map((col) => (
                          <th key={col} className="px-6 py-3 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.map((row, i) => (
                        <tr 
                          key={i} 
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {columns.map((col) => (
                            <td key={`${i}-${col}`} className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">
                              {String(row[col] ?? "NULL")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    {error ? "查询出错" : "无数据返回或执行成功"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
