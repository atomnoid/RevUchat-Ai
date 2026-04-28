import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * WhatsApp Connection API
 * 
 * POST /api/whatsapp/connect
 * Body: { action: 'send_otp' | 'verify_otp', businessName: string, phoneNumber: string, otp?: string }
 * 
 * This endpoint handles WhatsApp connection setup using the whatsapp_connections table:
 * - send_otp: Insert or update row with status 'pending_otp'
 * - verify_otp: Update status to 'setup_pending'
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, businessName, phoneNumber, otp } = body;

    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    if (action === 'send_otp') {
      // Check time restriction (10:00 AM – 12:00 AM)
      const now = new Date();
      const hours = now.getHours();
      if (hours < 10) {
        return NextResponse.json({ 
          success: false, 
          error: 'Verification available between 10:00 AM – 12:00 AM' 
        }, { status: 400 });
      }

      // Generate random 6-digit OTP (simulated)
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // Check if connection already exists for this user
      const { data: existingConnection } = await supabase
        .from('whatsapp_connections')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingConnection) {
        // Update existing connection
        const { error } = await supabase
          .from('whatsapp_connections')
          .update({
            business_name: businessName,
            phone_number: phoneNumber,
            otp: generatedOtp,
            otp_sent_at: new Date().toISOString(),
            status: 'pending_otp',
          })
          .eq('id', existingConnection.id);

        if (error) {
          console.error('Error updating WhatsApp connection:', error);
          return NextResponse.json({ success: false, error: 'Failed to update connection details' }, { status: 500 });
        }
      } else {
        // Insert new connection
        const { error } = await supabase
          .from('whatsapp_connections')
          .insert({
            user_id: userId,
            business_name: businessName,
            phone_number: phoneNumber,
            otp: generatedOtp,
            otp_sent_at: new Date().toISOString(),
            status: 'pending_otp',
          });

        if (error) {
          console.error('Error creating WhatsApp connection:', error);
          return NextResponse.json({ success: false, error: 'Failed to create connection' }, { status: 500 });
        }
      }

      // In real implementation, send OTP via WhatsApp API
      // For now, we'll log it (in production, this should be sent securely)
      console.log(`OTP for ${phoneNumber}: ${generatedOtp}`);

      return NextResponse.json({ 
        success: true, 
        message: 'OTP sent successfully',
        // For demo purposes, return the OTP (remove in production)
        otp: generatedOtp 
      });

    } else if (action === 'verify_otp') {
      if (!otp || otp.length !== 6) {
        return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 });
      }

      // Get user's WhatsApp connection
      const { data: connection, error: fetchError } = await supabase
        .from('whatsapp_connections')
        .select('otp, status')
        .eq('user_id', userId)
        .single();

      if (fetchError || !connection) {
        return NextResponse.json({ success: false, error: 'Connection not found. Please start verification first.' }, { status: 404 });
      }

      if (connection.otp !== otp) {
        return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 });
      }

      // Update status to 'setup_pending'
      const { error: updateError } = await supabase
        .from('whatsapp_connections')
        .update({
          status: 'setup_pending',
          otp: null, // Clear OTP after verification
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating WhatsApp status:', updateError);
        return NextResponse.json({ success: false, error: 'Failed to update connection status' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'WhatsApp connection setup in progress. Usually completes within a few minutes (max 24 hours).' 
      });

    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('WhatsApp connection error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
