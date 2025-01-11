/*
  # Add storage bucket for payment documents

  1. Storage
    - Creates 'payment-documents' bucket for storing payment receipts and documents
  2. Security
    - Adds policies for authenticated users to:
      - Upload documents
      - Download documents
      - Delete documents
*/

DO $$
BEGIN
  -- Create the storage bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name)
  VALUES ('payment-documents', 'payment-documents')
  ON CONFLICT (id) DO NOTHING;

  -- Set up storage policy to allow authenticated users to upload files
  INSERT INTO storage.policies (bucket_id, name, definition)
  VALUES 
    ('payment-documents', 'Allow authenticated uploads', '{"role":"authenticated","permission":"INSERT"}'),
    ('payment-documents', 'Allow authenticated downloads', '{"role":"authenticated","permission":"SELECT"}'),
    ('payment-documents', 'Allow authenticated deletes', '{"role":"authenticated","permission":"DELETE"}')
  ON CONFLICT (bucket_id, name) DO NOTHING;
END $$;