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

    return NextResponse.json({ message: 'Database tables created successfully' });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
