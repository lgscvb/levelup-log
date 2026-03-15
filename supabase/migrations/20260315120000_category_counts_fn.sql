-- Efficient per-category achievement counts (uses idx_achievements_category)
-- Replaces JS-side full-table-scan in check-unlocks Edge Function
CREATE OR REPLACE FUNCTION get_category_counts(p_user_id UUID)
RETURNS TABLE(category TEXT, cnt BIGINT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT category, COUNT(*) AS cnt
  FROM achievements
  WHERE user_id = p_user_id
  GROUP BY category;
$$;
