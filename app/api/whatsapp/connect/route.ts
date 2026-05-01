import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimiter';
import { whatsappConnectRequestSchema } from '@/lib/validators';
import { createClient } from '@supabase/supabase-js';

/**
 * WhatsApp Connection API - Call-based Verification
 * 
 * POST /api/whatsapp/connect
 * Body: { action: 'start_verification' | 'retry_verification', businessName: string, phoneNumber: string }
 * Headers: Authorization: Bearer <access_token>
 * 
 * This endpoint handles WhatsApp connection setup using call-based verification:
 * - start_verification: Insert or update row with status 'pending_call'
 * - retry_verification: Update status back to 'pending_call' if 1 hour has passed
 */

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = rateLimit(ip, 5, 60000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();

    // Validate input using Zod
    const validationResult = whatsappConnectRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid input data',
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const { action, businessName, phoneNumber } = validationResult.data;

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized - No authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Create Supabase client with the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify the token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // console.log('User check:', { user: !!user, userError });
    
    if (!user || userError) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const userId = user.id;

    if (action === 'start_verification' || action === 'retry_verification') {
      // Check if connection already exists
      const { data: existingConnection, error: fetchError } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (action === 'retry_verification') {
        // Check if 1 hour has passed since last update
        if (existingConnection && existingConnection.updated_at) {
          const lastUpdate = new Date(existingConnection.updated_at);
          const now = new Date();
          const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceUpdate < 1) {
            return NextResponse.json({ 
              success: false, 
              error: 'Please wait 1 hour before retrying verification' 
            }, { status: 400 });
          }
        }
      }

      if (existingConnection) {
        // Update existing connection
        const { error } = await supabase
          .from('whatsapp_connections')
          .update({
            business_name: businessName,
            phone_number: phoneNumber,
            status: 'pending_call',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingConnection.id);

        if (error) {
          return NextResponse.json({ success: false, error: 'Failed to update connection' }, { status: 500 });
        }
      } else {
        // Insert new connection
        const { error } = await supabase
          .from('whatsapp_connections')
          .insert({
            user_id: userId,
            business_name: businessName,
            phone_number: phoneNumber,
            status: 'pending_call',
          });

        if (error) {
          return NextResponse.json({ success: false, error: 'Failed to create connection' }, { status: 500 });
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Verification request submitted. You will receive a call within 1 hour.',
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
