import { NextResponse } from 'next/server';
import { getLinks, saveLinks } from '@/lib/data';

export async function GET() {
  const links = await getLinks();
  return NextResponse.json(links);
}

export async function POST(request: Request) {
  try {
    const links = await request.json();
    await saveLinks(links);
    return NextResponse.json({ success: true, message: 'Links updated' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating links' }, { status: 500 });
  }
}
