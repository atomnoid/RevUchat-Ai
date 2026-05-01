import { z } from 'zod';

// Signup validation schema
export const signupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be at most 100 characters'),
});

// Customer validation schema
export const customerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be at most 50 characters')
    .trim(),
  phone: z.string()
    .min(8, 'Phone number must be at least 8 characters')
    .max(15, 'Phone number must be at most 15 characters')
    .trim(),
});

// Customer update schema (status only)
export const customerUpdateSchema = z.object({
  status: z.enum(['pending', 'positive', 'negative'], {
    errorMap: () => ({ message: 'Invalid status value' }),
  }),
});

// Message validation schema
export const messageSchema = z.object({
  customer_id: z.string()
    .uuid('Invalid customer ID format')
    .trim(),
  content: z.string()
    .min(1, 'Message content is required')
    .max(500, 'Message must be at most 500 characters')
    .trim(),
});

// Send message request schema
export const sendMessageSchema = z.object({
  customerName: z.string()
    .min(1, 'Customer name is required')
    .max(50, 'Customer name must be at most 50 characters')
    .trim(),
  customerPhone: z.string()
    .min(8, 'Phone number must be at least 8 characters')
    .max(15, 'Phone number must be at most 15 characters')
    .trim(),
  message: z.string()
    .min(1, 'Message is required')
    .max(1000, 'Message must be at most 1000 characters')
    .trim(),
});

// Simulate response schema
export const simulateResponseSchema = z.object({
  customerId: z.string()
    .uuid('Invalid customer ID format')
    .trim(),
  response: z.enum(['positive', 'negative'], {
    errorMap: () => ({ message: 'Invalid response value' }),
  }),
});

// WhatsApp connection schema
export const whatsappConnectionSchema = z.object({
  business_name: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be at most 100 characters')
    .trim(),
  phone_number: z.string()
    .min(8, 'Phone number must be at least 8 characters')
    .max(15, 'Phone number must be at most 15 characters')
    .trim(),
});

// WhatsApp connection request schema (with action)
export const whatsappConnectRequestSchema = z.object({
  action: z.enum(['start_verification', 'retry_verification'], {
    errorMap: () => ({ message: 'Invalid action' }),
  }),
  businessName: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be at most 100 characters')
    .trim(),
  phoneNumber: z.string()
    .min(8, 'Phone number must be at least 8 characters')
    .max(15, 'Phone number must be at most 15 characters')
    .trim(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required'),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SimulateResponseInput = z.infer<typeof simulateResponseSchema>;
export type WhatsAppConnectionInput = z.infer<typeof whatsappConnectionSchema>;
export type WhatsAppConnectRequestInput = z.infer<typeof whatsappConnectRequestSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
