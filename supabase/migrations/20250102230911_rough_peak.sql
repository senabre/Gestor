/*
  # Fix Player Salaries Foreign Key

  1. Changes
    - Drop existing player_salaries table if exists
    - Recreate player_salaries table with correct foreign key reference to salary_players
    - Add RLS policies
*/

-- Drop existing table and recreate with correct reference
DROP TABLE IF EXISTS player_salaries CASCADE;

CREATE TABLE player_salaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES salary_players(id) ON DELETE CASCADE,
  salary integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE player_salaries ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'player_salaries' 
    AND policyname = 'Allow all operations for authenticated users'
  ) THEN
    CREATE POLICY "Allow all operations for authenticated users" ON player_salaries
      FOR ALL TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;