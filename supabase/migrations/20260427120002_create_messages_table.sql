/*
  # Create messages table for RevUchat AI

  This table stores all message history between users and customers

  1. New Table
    - `messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - references users.id
      - `customer_id` (uuid, foreign key) - references customers.id
      - `direction` (text) - 'sent' | 'received'
      - `content` (text) - message content
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `messages` table
    - Users can only access their own messages (via user_id)

  3. Notes
    - direction 'sent' = message sent to customer
    - direction 'received' = message received from customer
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('sent', 'received')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can insert own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);
CREATE INDEX IF NOT EXISTS messages_customer_id_idx ON messages(customer_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);
