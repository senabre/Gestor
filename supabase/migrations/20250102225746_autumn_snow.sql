/*
  # Add staff and player payments management

  1. New Tables
    - `staff_payments`
      - `id` (uuid, primary key)
      - `staff_id` (uuid, foreign key to staff)
      - `amount` (integer) - stored in cents
      - `payment_date` (timestamptz)
      - `receipt_number` (text)
      - `notes` (text)
      - `created_at` (timestamptz)

    - `player_salaries`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key to players)
      - `salary` (integer) - stored in cents
      - `created_at` (timestamptz)

    - `player_salary_payments`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key to players)
      - `amount` (integer) - stored in cents
      - `payment_date` (timestamptz)
      - `receipt_number` (text)
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Staff Payments
CREATE TABLE IF NOT EXISTS staff_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES staff(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  payment_date timestamptz DEFAULT now(),
  receipt_number text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE staff_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON staff_payments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Player Salaries
CREATE TABLE IF NOT EXISTS player_salaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  salary integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE player_salaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON player_salaries
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Player Salary Payments
CREATE TABLE IF NOT EXISTS player_salary_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  payment_date timestamptz DEFAULT now(),
  receipt_number text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE player_salary_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON player_salary_payments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);