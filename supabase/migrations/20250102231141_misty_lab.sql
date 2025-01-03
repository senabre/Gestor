-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS player_salary_payments CASCADE;
DROP TABLE IF EXISTS player_salaries CASCADE;
DROP TABLE IF EXISTS salary_players CASCADE;
DROP TABLE IF EXISTS salary_teams CASCADE;

-- Create salary teams table
CREATE TABLE salary_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create salary players table
CREATE TABLE salary_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES salary_teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Create player salaries table
CREATE TABLE player_salaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES salary_players(id) ON DELETE CASCADE,
  salary integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create player salary payments table
CREATE TABLE player_salary_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES salary_players(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  payment_date timestamptz DEFAULT now(),
  receipt_number text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE salary_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_salary_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations for authenticated users" ON salary_teams
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON salary_players
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON player_salaries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON player_salary_payments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);