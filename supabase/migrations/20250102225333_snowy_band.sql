/*
  # Add staff management tables

  1. New Tables
    - `staff`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, required)
      - `phone` (text)
      - `position` (text, required)
      - `salary` (integer, required) - stored in cents
      - `team_id` (uuid, foreign key to teams)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `staff` table
    - Add policy for authenticated users to manage staff data
*/

CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  position text NOT NULL,
  salary integer NOT NULL DEFAULT 0,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON staff
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);