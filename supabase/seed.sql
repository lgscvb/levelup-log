-- LevelUp.log Seed Data: Initial Title Definitions
-- Run after migrations to populate title_definitions table

-- XP Cumulative Titles
INSERT INTO title_definitions (name, description, requirement_type, requirement_value, rarity, icon) VALUES
  ('Newcomer', 'Welcome to the game of life.', 'total_xp', '{"min_xp": 0}', 'common', NULL),
  ('Apprentice', 'Your journey has begun.', 'total_xp', '{"min_xp": 500}', 'common', NULL),
  ('Journeyman', 'Steadily building your legacy.', 'total_xp', '{"min_xp": 2000}', 'uncommon', NULL),
  ('Expert', 'You''ve proven yourself many times over.', 'total_xp', '{"min_xp": 10000}', 'rare', NULL),
  ('Master', 'Few reach this level of dedication.', 'total_xp', '{"min_xp": 50000}', 'epic', NULL),
  ('Grandmaster', 'A legend among legends.', 'total_xp', '{"min_xp": 200000}', 'legendary', NULL);

-- Category Specialty Titles
INSERT INTO title_definitions (name, description, requirement_type, requirement_value, rarity, icon) VALUES
  ('Bug Slayer', 'Vanquished 50 bugs. They fear you.', 'category_count', '{"category": "fix", "count": 50}', 'rare', NULL),
  ('Test Knight', 'Guardian of quality with 100 test achievements.', 'category_count', '{"category": "test", "count": 100}', 'rare', NULL),
  ('Doc Wizard', 'The one who actually writes documentation.', 'category_count', '{"category": "docs", "count": 30}', 'uncommon', NULL),
  ('Life Juggler', 'Balanced 100 life tasks while keeping everything together.', 'category_count', '{"category": "life", "count": 100}', 'rare', NULL);

-- Streak Titles
INSERT INTO title_definitions (name, description, requirement_type, requirement_value, rarity, icon) VALUES
  ('Consistent', 'Active for 7 days straight.', 'streak', '{"days": 7}', 'common', NULL),
  ('Dedicated', '30-day streak. This is who you are now.', 'streak', '{"days": 30}', 'uncommon', NULL),
  ('Unstoppable', '100-day streak. Nothing can break you.', 'streak', '{"days": 100}', 'epic', NULL);

-- Annual Titles
INSERT INTO title_definitions (name, description, requirement_type, requirement_value, rarity, icon) VALUES
  ('Year Champion', 'Earned over 10,000 XP in a single year.', 'year_xp', '{"min_xp": 10000}', 'rare', NULL);

-- Special Titles
INSERT INTO title_definitions (name, description, requirement_type, requirement_value, rarity, icon) VALUES
  ('Comeback King', 'Went silent for 30 days, then came back with a 7-day streak.', 'special', '{"type": "comeback", "gap_days": 30, "streak_days": 7}', 'epic', NULL);
