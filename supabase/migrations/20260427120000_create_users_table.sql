/*
  # Create users table for RevUchat AI

  This table extends Supabase auth.users with additional SaaS-specific fields

  1. New Table
    - `users`
      - `id` (uuid, primary key) - references auth.users.id
      - `email` (text) - user email
      - `plan` (text) - 'starter' | 'growth' | 'scale'
      - `message_limit` (integer) - monthly message limit based on plan
      - `messages_used` (integer) - messages used in current month
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `users` table
    - Users can only see their own record
    - Users can only update their own record

  3. Plan Limits
    - starter: 200 messages
    - growth: 500 messages
    - scale: 1000 messages
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  plan text NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'scale')),
  message_limit integer NOT NULL DEFAULT 200,
  messages_used integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own record
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own record (trigger will handle this)
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own record
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_plan_idx ON users(plan);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, plan, message_limit, messages_used)
  VALUES (
    NEW.id,
    NEW.email,
    'starter',
    200,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
