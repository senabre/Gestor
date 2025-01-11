/*
  # Fix storage bucket RLS policies

  1. Changes
    - Update storage bucket policies to properly handle authenticated users
    - Add proper RLS policies for file access
*/

-- Create storage bucket for payment documents with proper RLS
DO $$
BEGIN
  -- Create the storage bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('payment-documents', 'payment-documents', false)
  ON CONFLICT (id) DO NOTHING;

  -- Drop existing policies if any
  DELETE FROM storage.policies 
  WHERE bucket_id = 'payment-documents';

  -- Create proper RLS policies
  INSERT INTO storage.policies (bucket_id, name, definition)
  VALUES 
    (
      'payment-documents',
      'Allow authenticated uploads',
      jsonb_build_object(
        'role', 'authenticated',
        'permission', 'INSERT',
        'check', 'true'
      )
    ),
    (
      'payment-documents',
      'Allow authenticated downloads',
      jsonb_build_object(
        'role', 'authenticated',
        'permission', 'SELECT',
        'check', 'true'
      )
    ),
    (
      'payment-documents',
      'Allow authenticated deletes',
      jsonb_build_object(
        'role', 'authenticated',
        'permission', 'DELETE',
        'check', 'true'
      )
    );
END $$;