import { supabase } from '@/lib/supabase';

/**
 * Messaging Service
 * 
 * This service handles all messaging operations.
 * Currently uses simulated messaging (no external API).
 * 
 * FUTURE INTEGRATION:
 * - WhatsApp Business API can be integrated here
 * - Replace simulated send with actual WhatsApp API calls
 * - Add webhook handling for incoming messages
 */

export interface SendMessageParams {
  userId: string;
  customerName: string;
  customerPhone: string;
  message: string;
}

export interface SendMessageResult {
  success: boolean;
  customerId?: string;
  messageId?: string;
  error?: string;
}

/**
 * Send a message to a customer
 * 
 * Currently: Simulates sending and saves to database
 * Future: Will call WhatsApp API
 */
export async function sendMessage(params: SendMessageParams): Promise<SendMessageResult> {
  try {
    // Check user's message limit
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('message_limit, messages_used')
      .eq('id', params.userId)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'Failed to fetch user data' };
    }

    if (userData.messages_used >= userData.message_limit) {
      return { 
        success: false, 
        error: `Message limit reached. You have used ${userData.messages_used} of ${userData.message_limit} messages.` 
      };
    }

    // Create customer record
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        user_id: params.userId,
        name: params.customerName,
        phone: params.customerPhone,
        status: 'pending',
      })
      .select()
      .single();

    if (customerError) {
      return { success: false, error: 'Failed to create customer' };
    }

    // Create message record
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        user_id: params.userId,
        customer_id: customer.id,
        direction: 'sent',
        content: params.message,
      })
      .select()
      .single();

    if (messageError) {
      return { success: false, error: 'Failed to save message' };
    }

    // Increment messages_used
    const { error: updateError } = await supabase
      .from('users')
      .update({ messages_used: userData.messages_used + 1 })
      .eq('id', params.userId);

    if (updateError) {
      console.error('Failed to increment message count:', updateError);
    }

    // FUTURE: Call WhatsApp API here
    // const whatsappResponse = await whatsappApi.sendMessage(params.customerPhone, params.message);

    return {
      success: true,
      customerId: customer.id,
      messageId: message.id,
    };
  } catch (error) {
    console.error('Send message error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all customers for a user
 */
export async function getCustomers(userId: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }

  return data || [];
}

/**
 * Get messages for a specific customer
 */
export async function getCustomerMessages(customerId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}
