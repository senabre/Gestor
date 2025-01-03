-- First ensure we have no duplicate settings
WITH latest_settings AS (
  SELECT DISTINCT ON (user_id)
    id,
    user_id,
    settings,
    created_at,
    updated_at
  FROM user_settings
  ORDER BY user_id, updated_at DESC
)
DELETE FROM user_settings
WHERE id NOT IN (SELECT id FROM latest_settings);

-- Drop existing constraint if it exists
ALTER TABLE user_settings
DROP CONSTRAINT IF EXISTS user_settings_user_id_key;

-- Add unique constraint
ALTER TABLE user_settings
ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
CREATE POLICY "Users can update their own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
CREATE POLICY "Users can insert their own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);