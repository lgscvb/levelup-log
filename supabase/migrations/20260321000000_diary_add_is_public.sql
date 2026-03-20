-- Add is_public column to diary_entries
ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Drop existing policy
DROP POLICY IF EXISTS "Users manage own diary" ON diary_entries;

-- Separate policies for better control
CREATE POLICY "Users can read own diary" ON diary_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read public diary" ON diary_entries FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert own diary" ON diary_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary" ON diary_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary" ON diary_entries FOR DELETE
  USING (auth.uid() = user_id);
