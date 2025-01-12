/*
  # Fix Storage Policies Syntax

  1. Changes
    - Fix syntax error in storage policies check conditions
    - Use proper string format for policy definitions

  2. Security
    - Maintain same security rules but with correct syntax
*/

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
      '{"role":"authenticated","permission":"INSERT","check":"(role() = ''authenticated'')"}'::jsonb
    ),
    (
      'payment-documents',
      'Allow authenticated downloads',
      '{"role":"authenticated","permission":"SELECT","check":"(role() = ''authenticated'')"}'::jsonb
    ),
    (
      'payment-documents',
      'Allow authenticated deletes',
      '{"role":"authenticated","permission":"DELETE","check":"(role() = ''authenticated'')"}'::jsonb
    );
END $$;