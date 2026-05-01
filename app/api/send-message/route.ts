import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendMessage } from '@/services/messagingService';
import { rateLimit } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = rateLimit(ip, 15, 60000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customerName, customerPhone, message } = body;

    if (!customerName || !customerPhone || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = customerName.trim().slice(0, 100);
    const sanitizedPhone = customerPhone.trim().slice(0, 20);
    const sanitizedMessage = message.trim().slice(0, 1000);

    const result = await sendMessage({
      userId: session.user.id,
      customerName: sanitizedName,
      customerPhone: sanitizedPhone,
      message: sanitizedMessage,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      customerId: result.customerId,
      messageId: result.messageId,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
