/*
  # Fix RLS Policies for Payments and Storage

  1. Changes
    - Add proper RLS policies for payments table
    - Fix storage bucket policies for payment documents
    - Add proper RLS policies for player_salary_payments table

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Fix storage bucket permissions
*/

-- Fix payments table RLS
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON payments;

CREATE POLICY "Allow authenticated users to create payments"
ON payments FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read payments"
ON payments FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update payments"
ON payments FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete payments"
ON payments FOR DELETE TO authenticated
USING (true);

-- Fix player_salary_payments table RLS
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON player_salary_payments;

CREATE POLICY "Allow authenticated users to create salary payments"
ON player_salary_payments FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read salary payments"
ON player_salary_payments FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update salary payments"
ON player_salary_payments FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete salary payments"
ON player_salary_payments FOR DELETE TO authenticated
USING (true);

-- Fix storage bucket policies
DO $$
BEGIN
  -- Create the storage bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('payment-documents', 'payment-documents', false)
  ON CONFLICT (id) DO NOTHING;

  -- Drop existing policies
  DELETE FROM storage.policies 
  WHERE bucket_id = 'payment-documents';

  -- Create new storage policies with proper permissions
  INSERT INTO storage.policies (bucket_id, name, definition)
  VALUES 
    (
      'payment-documents',
      'Allow authenticated uploads',
      jsonb_build_object(
        'role', 'authenticated',
        'permission', 'INSERT',
        'check', $$ auth.role() = 'authenticated' $$
      )
    ),
    (
      'payment-documents',
      'Allow authenticated downloads',
      jsonb_build_object(
        'role', 'authenticated',
        'permission', 'SELECT',
        'check', $$ auth.role() = 'authenticated' $$
      )
    ),
    (
      'payment-documents',
      'Allow authenticated deletes',
      jsonb_build_object(
        'role', 'authenticated',
        'permission', 'DELETE',
        'check', $$ auth.role() = 'authenticated' $$
      )
    );
END $$;