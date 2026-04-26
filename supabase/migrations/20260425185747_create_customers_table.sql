/*
  # Create customers table for RevUchat AI

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text) - customer display name
      - `phone` (text) - customer phone number
      - `status` (text) - 'pending' | 'positive' | 'negative'
      - `created_at` (timestamptz) - when the feedback request was sent
      - `updated_at` (timestamptz) - when the status was last updated
      - `user_id` (text) - mock user identifier (no real auth)

  2. Security
    - Enable RLS on `customers` table
    - Add policy for all operations (mock auth using user_id text field)

  3. Notes
    - Status defaults to 'pending'
    - user_id is a simple string for mock auth purposes
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'positive', 'negative')),
  user_id text NOT NULL DEFAULT 'demo-user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for demo"
  ON customers
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow insert for demo"
  ON customers
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update for demo"
  ON customers
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS customers_user_id_idx ON customers(user_id);
CREATE INDEX IF NOT EXISTS customers_status_idx ON customers(status);
CREATE INDEX IF NOT EXISTS customers_created_at_idx ON customers(created_at DESC);
