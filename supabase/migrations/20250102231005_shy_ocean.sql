-- Create player salary payments table
CREATE TABLE IF NOT EXISTS player_salary_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES salary_players(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  payment_date timestamptz DEFAULT now(),
  receipt_number text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE player_salary_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'player_salary_payments' 
    AND policyname = 'Allow all operations for authenticated users'
  ) THEN
    CREATE POLICY "Allow all operations for authenticated users" ON player_salary_payments
      FOR ALL TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;