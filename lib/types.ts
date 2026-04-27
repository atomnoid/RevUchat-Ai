export type CustomerStatus = 'pending' | 'positive' | 'negative';
export type PlanType = 'starter' | 'growth' | 'scale';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  status: CustomerStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'customer';
  content: string;
  timestamp: Date;
}

export interface User {
  id: string;
  email: string;
  plan: PlanType;
  message_limit: number;
  messages_used: number;
  created_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  customer_id: string;
  direction: 'sent' | 'received';
  content: string;
  created_at: string;
}
