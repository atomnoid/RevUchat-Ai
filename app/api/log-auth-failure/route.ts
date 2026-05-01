import { NextRequest, NextResponse } from 'next/server';
import { logFailedAuth } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    logFailedAuth(email, ip, userAgent);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Don't expose errors for logging endpoint
    return NextResponse.json({ success: true });
  }
}
