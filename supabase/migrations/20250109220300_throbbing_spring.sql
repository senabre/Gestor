/*
  # Add payment method support

  1. Changes
    - Add payment_method column to payments table
    - Add document_url column to payments table for transfer receipts
  
  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS document_url text;

-- Add check constraint for valid payment methods
ALTER TABLE payments
ADD CONSTRAINT valid_payment_method 
CHECK (payment_method IN ('cash', 'transfer'));