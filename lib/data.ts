import { sql } from '@vercel/postgres';

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  category: "dev" | "image" | "network" | "ai";
  isVisible: boolean;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  description?: string;
  category?: string;
}

export interface ApiConfig {
  id: string;
  service: string;
  apiKey: string;
  isActive: boolean;
}

export async function getTools(): Promise<Tool[]> {
  try {
    const { rows } = await sql`SELECT * FROM tools`;
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      icon: row.icon,
      href: row.href,
      color: row.color,
      category: row.category as any,
      isVisible: row.is_visible
    }));
  } catch (error) {
    // If table doesn't exist or other error, return empty array
    console.error('Database Error:', error);
    return [];
  }
}

export async function saveTools(tools: Tool[]) {
  // Transaction: Delete all and re-insert (Simple sync strategy)
  // Note: In a real high-concurrency app, you'd want individual updates.
  try {
    await sql`DELETE FROM tools`;
    for (const tool of tools) {
      await sql`
        INSERT INTO tools (id, title, description, icon, href, color, category, is_visible)
        VALUES (${tool.id}, ${tool.title}, ${tool.description}, ${tool.icon}, ${tool.href}, ${tool.color}, ${tool.category}, ${tool.isVisible})
      `;
    }
  } catch (error) {
    console.error('Failed to save tools:', error);
    throw error;
  }
}

export async function getLinks(): Promise<LinkItem[]> {
  try {
    const { rows } = await sql`SELECT * FROM links`;
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      url: row.url,
      icon: row.icon,
      description: row.description,
      category: row.category
    }));
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function saveLinks(links: LinkItem[]) {
  try {
    await sql`DELETE FROM links`;
    for (const link of links) {
      await sql`
        INSERT INTO links (id, title, url, icon, description, category)
        VALUES (${link.id}, ${link.title}, ${link.url}, ${link.icon}, ${link.description}, ${link.category})
      `;
    }
  } catch (error) {
    console.error('Failed to save links:', error);
    throw error;
  }
}

export async function getApiConfigs(): Promise<ApiConfig[]> {
  try {
    const { rows } = await sql`SELECT * FROM api_configs`;
    return rows.map(row => ({
      id: row.id,
      service: row.service,
      apiKey: row.api_key,
      isActive: row.is_active
    }));
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function saveApiConfigs(configs: ApiConfig[]) {
  try {
    await sql`DELETE FROM api_configs`;
    for (const config of configs) {
      await sql`
        INSERT INTO api_configs (id, service, api_key, is_active)
        VALUES (${config.id}, ${config.service}, ${config.apiKey}, ${config.isActive})
      `;
    }
  } catch (error) {
    console.error('Failed to save api configs:', error);
    throw error;
  }
}
