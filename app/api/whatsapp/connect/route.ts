import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * WhatsApp Connection API
 * 
 * POST /api/whatsapp/connect
 * Body: { action: 'send_otp' | 'verify_otp', businessName: string, phoneNumber: string, otp?: string }
 * 
 * This endpoint handles WhatsApp connection setup:
 * - Send OTP: Saves business details and generates OTP (simulated)
 * - Verify OTP: Validates OTP and updates connection status
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
      if (hours < 10 || hours >= 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Verification available between 10:00 AM – 12:00 AM' 
        }, { status: 400 });
      }

      // Generate random 6-digit OTP (simulated)
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // Save to database with status 'pending_otp'
      const { error } = await supabase
        .from('users')
        .update({
          whatsapp_business_name: businessName,
          whatsapp_number: phoneNumber,
          whatsapp_otp: generatedOtp,
          whatsapp_otp_sent_at: new Date().toISOString(),
          whatsapp_status: 'pending_otp',
        })
        .eq('id', userId);

      if (error) {
        console.error('Error saving WhatsApp connection:', error);
        return NextResponse.json({ success: false, error: 'Failed to save connection details' }, { status: 500 });
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

      // Verify OTP
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('whatsapp_otp, whatsapp_status')
        .eq('id', userId)
        .single();

      if (fetchError || !userData) {
        return NextResponse.json({ success: false, error: 'Failed to fetch user data' }, { status: 500 });
      }

      if (userData.whatsapp_otp !== otp) {
        return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 });
      }

      // Update status to 'setup_pending'
      const { error: updateError } = await supabase
        .from('users')
        .update({
          whatsapp_status: 'setup_pending',
          whatsapp_otp: null, // Clear OTP after verification
        })
        .eq('id', userId);

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
