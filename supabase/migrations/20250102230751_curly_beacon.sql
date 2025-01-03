/*
  # Salary Management System Tables

  1. New Tables
    - `salary_teams`: Teams specifically for salary management
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
    
    - `salary_players`: Players with salaries
      - `id` (uuid, primary key)
      - `team_id` (uuid, references salary_teams)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `created_at` (timestamp)
    
    - `player_salaries`: Salary history for players
      - `id` (uuid, primary key)
      - `player_id` (uuid, references salary_players)
      - `salary` (integer, stored in cents)
      - `created_at` (timestamp)
    
    - `player_salary_payments`: Payment records
      - `id` (uuid, primary key)
      - `player_id` (uuid, references salary_players)
      - `amount` (integer, stored in cents)
      - `payment_date` (timestamp)
      - `receipt_number` (text)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
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

-- Create player salaries table
CREATE TABLE IF NOT EXISTS player_salaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES salary_players(id) ON DELETE CASCADE,
  salary integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

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
ALTER TABLE salary_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_salary_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Allow all operations for authenticated users" ON salary_teams
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON salary_players
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON player_salaries
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON player_salary_payments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);