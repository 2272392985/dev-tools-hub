import { NextResponse } from 'next/server';
import { getApiConfigs, saveApiConfigs } from '@/lib/data';

export async function GET() {
  const configs = await getApiConfigs();
  // Mask API keys for security when sending to frontend, 
  // but for admin editing we might need to see them or just overwrite.
  // For now, let's send them as is since it's an admin route protected by client-side auth (weak)
  // In a real app, we should be more careful.
  return NextResponse.json(configs);
}

export async function POST(request: Request) {
  try {
    const configs = await request.json();
    await saveApiConfigs(configs);
    return NextResponse.json({ success: true, message: 'API Configs updated' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating API configs' }, { status: 500 });
  }
}
