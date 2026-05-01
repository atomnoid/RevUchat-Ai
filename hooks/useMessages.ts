import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Message } from '@/lib/types';

export function useMessages(userId: string | null, customerId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId);
      
      if (customerId) {
        query = query.eq('customer_id', customerId);
      }
      
      query = query.order('created_at', { ascending: true });
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw fetchError;
      }
      
      // console.log('useMessages: Messages fetched:', data);
      setMessages(data || []);
    } catch (err) {
      console.error('useMessages: Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [userId, customerId]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  return {
    messages,
    loading,
    error,
    refresh: fetchMessages,
    addMessage,
  };
}
