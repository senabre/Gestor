/*
  # Add update_player_paid_amount function

  1. New Functions
    - `update_player_paid_amount`: Updates a player's paid_amount safely
      - Parameters:
        - p_player_id (uuid): The player's ID
        - p_amount (integer): The amount to add/subtract (positive or negative)
      - Returns: void
      - Handles concurrent updates safely using FOR UPDATE
*/

CREATE OR REPLACE FUNCTION update_player_paid_amount(
  p_player_id uuid,
  p_amount integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Lock the player row for update to prevent concurrent modifications
  UPDATE players
  SET paid_amount = GREATEST(0, paid_amount + p_amount)
  WHERE id = p_player_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player not found';
  END IF;
END;
$$;