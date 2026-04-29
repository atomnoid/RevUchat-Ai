import { NextRequest, NextResponse } from 'next/server';
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
    const body = await request.json();
    const { action, businessName, phoneNumber } = body;

    console.log('WhatsApp connect API called:', { action, businessName, phoneNumber });

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No authorization header found');
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
    
    console.log('User check:', { user: !!user, userError });
    
    if (!user || userError) {
      console.error('Invalid token or user not found');
      return NextResponse.json({ success: false, error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const userId = user.id;
    console.log('User ID:', userId);

    if (action === 'start_verification' || action === 'retry_verification') {
      // Validate inputs
      if (!businessName || !phoneNumber) {
        return NextResponse.json({ success: false, error: 'Business name and phone number are required' }, { status: 400 });
      }

      // Check if connection already exists
      const { data: existingConnection, error: fetchError } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', userId)
        .single();

      console.log('Existing connection check:', { existingConnection, fetchError });

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

        console.log('Update connection result:', { error });

        if (error) {
          console.error('Error updating WhatsApp connection:', error);
          return NextResponse.json({ success: false, error: `Failed to update connection: ${error.message}` }, { status: 500 });
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

        console.log('Insert connection result:', { error });

        if (error) {
          console.error('Error creating WhatsApp connection:', error);
          return NextResponse.json({ success: false, error: `Failed to create connection: ${error.message}` }, { status: 500 });
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Verification request submitted. You will receive a call within 1 hour.',
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('WhatsApp connect API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
