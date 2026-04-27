import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, response } = body;

    if (!customerId || !response) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify customer belongs to user
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('user_id', session.user.id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Update customer status
    const newStatus = response === 'positive' ? 'positive' : 'negative';
    const { error: updateError } = await supabase
      .from('customers')
      .update({ status: newStatus })
      .eq('id', customerId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update customer status' }, { status: 500 });
    }

    // Add message based on response
    const messageContent = response === 'positive'
      ? 'Thank you for your positive feedback! Please leave us a review on Google.'
      : 'We\'re sorry to hear that. Please tell us more about what went wrong.';

    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        user_id: session.user.id,
        customer_id: customerId,
        direction: 'sent',
        content: messageContent,
      });

    if (messageError) {
      console.error('Failed to add message:', messageError);
    }

    return NextResponse.json({ 
      success: true, 
      status: newStatus,
      message: messageContent,
    });
  } catch (error) {
    console.error('Simulate response API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
