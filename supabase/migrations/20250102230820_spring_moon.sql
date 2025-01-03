/*
  # Salary Management System Tables

  1. New Tables
    - `salary_teams`: Teams for salary management
    - `salary_players`: Players with salaries
  
  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create salary teams table
CREATE TABLE IF NOT EXISTS salary_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create salary players table
CREATE TABLE IF NOT EXISTS salary_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES salary_teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE salary_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_players ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'salary_teams' 
    AND policyname = 'Allow all operations for authenticated users'
  ) THEN
    CREATE POLICY "Allow all operations for authenticated users" ON salary_teams
      FOR ALL TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'salary_players' 
    AND policyname = 'Allow all operations for authenticated users'
  ) THEN
    CREATE POLICY "Allow all operations for authenticated users" ON salary_players
      FOR ALL TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;