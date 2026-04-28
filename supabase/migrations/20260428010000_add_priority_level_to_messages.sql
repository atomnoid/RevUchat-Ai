-- Add priority_level column to messages table for priority sending
-- This enables queue processing based on user plan

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 1;

-- Add index for efficient priority queue queries
CREATE INDEX IF NOT EXISTS idx_messages_priority_queue 
ON messages (priority_level DESC, created_at ASC)
WHERE direction = 'sent';

-- Update existing messages to have default priority
UPDATE messages 
SET priority_level = 1 
WHERE priority_level IS NULL;
