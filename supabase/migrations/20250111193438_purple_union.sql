/*
  # Add payment method and receipt file support

  1. Changes
    - Add payment method and receipt file columns to player_salary_payments table
    - Add constraint to ensure valid payment methods
  2. Storage
    - Creates 'payment-documents' bucket for storing payment receipts
*/

-- Add payment method and receipt file columns
ALTER TABLE player_salary_payments 
ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS document_url text;

-- Add check constraint for valid payment methods
ALTER TABLE player_salary_payments
ADD CONSTRAINT valid_payment_method_salary 
CHECK (payment_method IN ('cash', 'transfer'));

-- Create storage bucket for payment documents
DO $$
BEGIN
  -- Create the storage bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('payment-documents', 'payment-documents', false)
  ON CONFLICT (id) DO NOTHING;

  -- Set up storage policies
  INSERT INTO storage.policies (bucket_id, name, definition)
  VALUES 
    ('payment-documents', 'Allow authenticated uploads', '{"role":"authenticated","permission":"INSERT"}'),
    ('payment-documents', 'Allow authenticated downloads', '{"role":"authenticated","permission":"SELECT"}'),
    ('payment-documents', 'Allow authenticated deletes', '{"role":"authenticated","permission":"DELETE"}')
  ON CONFLICT (bucket_id, name) DO NOTHING;
END $$;