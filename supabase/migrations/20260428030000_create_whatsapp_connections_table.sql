-- Create whatsapp_connections table for WhatsApp onboarding
-- This table stores WhatsApp connection details separate from users table

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS whatsapp_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_connected',
  otp TEXT,
  otp_sent_at TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist (for partial migrations)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'whatsapp_connections' AND column_name = 'otp'
    ) THEN
        ALTER TABLE whatsapp_connections ADD COLUMN otp TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'whatsapp_connections' AND column_name = 'otp_sent_at'
    ) THEN
        ALTER TABLE whatsapp_connections ADD COLUMN otp_sent_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'whatsapp_connections' AND column_name = 'connected_at'
    ) THEN
        ALTER TABLE whatsapp_connections ADD COLUMN connected_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'whatsapp_connections' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE whatsapp_connections ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'whatsapp_connections' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE whatsapp_connections ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add check constraint for status values
ALTER TABLE whatsapp_connections
DROP CONSTRAINT IF EXISTS check_whatsapp_status;

ALTER TABLE whatsapp_connections
ADD CONSTRAINT check_whatsapp_status 
CHECK (status IN ('not_connected', 'pending_otp', 'setup_pending', 'active'));

-- Create unique constraint on user_id to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_connections_user_id 
ON whatsapp_connections (user_id);

-- Create index for faster queries on status
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_status 
ON whatsapp_connections (status);

-- Enable Row Level Security
ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own WhatsApp connection
CREATE POLICY "Users can view own whatsapp connection"
ON whatsapp_connections FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own WhatsApp connection
CREATE POLICY "Users can insert own whatsapp connection"
ON whatsapp_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own WhatsApp connection
CREATE POLICY "Users can update own whatsapp connection"
ON whatsapp_connections FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own WhatsApp connection
CREATE POLICY "Users can delete own whatsapp connection"
ON whatsapp_connections FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for automatic UI updates
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_connections;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_whatsapp_connections_updated_at
BEFORE UPDATE ON whatsapp_connections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
