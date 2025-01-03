/*
  # Sports Club Management Schema

  1. New Tables
    - `teams`
      - `id` (uuid, primary key)
      - `name` (text) - Team name
      - `created_at` (timestamp)
      
    - `players`
      - `id` (uuid, primary key)
      - `team_id` (uuid, foreign key)
      - `name` (text) - Player name
      - `email` (text)
      - `phone` (text)
      - `total_fee` (integer) - Total fee amount in cents
      - `paid_amount` (integer) - Amount paid in cents
      - `created_at` (timestamp)
      
    - `payments`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key)
      - `amount` (integer) - Payment amount in cents
      - `payment_date` (timestamp)
      - `receipt_number` (text)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create teams table
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create players table
CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  total_fee integer NOT NULL DEFAULT 0,
  paid_amount integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  payment_date timestamptz DEFAULT now(),
  receipt_number text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations for authenticated users" ON teams
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON players
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON payments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);