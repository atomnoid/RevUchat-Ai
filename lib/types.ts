export type CustomerStatus = 'pending' | 'positive' | 'negative';

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
