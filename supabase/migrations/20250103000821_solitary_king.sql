-- First, keep only the most recent settings for each user
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

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_settings_user_id_key'
  ) THEN
    ALTER TABLE user_settings
    ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);
  END IF;
END $$;