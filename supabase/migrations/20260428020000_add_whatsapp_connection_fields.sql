-- Add WhatsApp connection fields to users table
-- This stores the WhatsApp connection status and details

ALTER TABLE users
ADD COLUMN IF NOT EXISTS whatsapp_business_name TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_status TEXT DEFAULT 'not_connected',
ADD COLUMN IF NOT EXISTS whatsapp_otp TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_otp_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS whatsapp_connected_at TIMESTAMP WITH TIME ZONE;

-- Add check constraint for whatsapp_status values
ALTER TABLE users
ADD CONSTRAINT check_whatsapp_status 
CHECK (whatsapp_status IN ('not_connected', 'pending_otp', 'setup_pending', 'active'));

-- Add index for faster queries on whatsapp status
CREATE INDEX IF NOT EXISTS idx_users_whatsapp_status 
ON users (whatsapp_status);
