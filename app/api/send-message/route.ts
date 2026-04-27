import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendMessage } from '@/services/messagingService';

export async function POST(request: NextRequest) {
  try {
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

    const result = await sendMessage({
      userId: session.user.id,
      customerName,
      customerPhone,
      message,
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
    console.error('Send message API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
