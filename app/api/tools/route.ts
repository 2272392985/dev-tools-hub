import { NextResponse } from 'next/server';
import { getTools, saveTools } from '@/lib/data';

export async function GET() {
  const tools = await getTools();
  return NextResponse.json(tools);
}

export async function POST(request: Request) {
  try {
    const tools = await request.json();
    await saveTools(tools);
    return NextResponse.json({ success: true, message: 'Tools updated' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating tools' }, { status: 500 });
  }
}
