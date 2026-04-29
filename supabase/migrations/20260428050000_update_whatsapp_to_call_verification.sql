-- Update whatsapp_connections table for call-based verification
-- Remove OTP columns and update status values

-- First, update existing rows to valid status values
UPDATE whatsapp_connections 
SET status = 'not_connected' 
WHERE status NOT IN ('not_connected', 'pending_call', 'active', 'failed');

-- Drop OTP columns
ALTER TABLE whatsapp_connections 
DROP COLUMN IF EXISTS otp;

ALTER TABLE whatsapp_connections 
DROP COLUMN IF EXISTS otp_sent_at;

-- Drop old status constraint
ALTER TABLE whatsapp_connections 
DROP CONSTRAINT IF EXISTS check_whatsapp_status;

-- Add new status constraint with call-based statuses
ALTER TABLE whatsapp_connections
ADD CONSTRAINT check_whatsapp_status 
CHECK (status IN ('not_connected', 'pending_call', 'active', 'failed'));
