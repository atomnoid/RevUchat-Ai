-- Add missing columns to whatsapp_connections table
-- This migration ensures all required columns exist

ALTER TABLE whatsapp_connections 
ADD COLUMN IF NOT EXISTS otp TEXT;

ALTER TABLE whatsapp_connections 
ADD COLUMN IF NOT EXISTS otp_sent_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE whatsapp_connections 
ADD COLUMN IF NOT EXISTS connected_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE whatsapp_connections 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE whatsapp_connections 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
