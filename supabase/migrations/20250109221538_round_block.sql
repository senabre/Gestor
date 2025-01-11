-- Add payment_method and document_url columns
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS document_url text;

-- Add check constraint for valid payment methods
ALTER TABLE payments
ADD CONSTRAINT valid_payment_method 
CHECK (payment_method IN ('cash', 'transfer'));

-- Create storage bucket for payment documents
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