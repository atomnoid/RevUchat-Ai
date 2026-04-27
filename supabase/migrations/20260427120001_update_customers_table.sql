/*
  # Update customers table for proper auth integration

  This migration updates the existing customers table to:
  - Use proper UUID references to users table
  - Enable proper RLS with auth.uid()
  - Add updated_at trigger
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for demo" ON customers;
DROP POLICY IF EXISTS "Allow insert for demo" ON customers;
DROP POLICY IF EXISTS "Allow update for demo" ON customers;

-- Add user_id foreign key constraint
ALTER TABLE customers
  DROP CONSTRAINT IF EXISTS customers_user_id_fkey,
  ADD CONSTRAINT customers_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- Update RLS policies for proper auth
CREATE POLICY "Users can view own customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
