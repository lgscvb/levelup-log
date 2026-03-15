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

-- Category Specialty Titles (17 categories × 1 title each)
INSERT INTO title_definitions (name, description, requirement_type, requirement_value, rarity, icon) VALUES
  -- Technical
  ('Code Artisan',    '在 code 類別完成 100 項成就。從打字員進化為匠人。',         'category_count', '{"category": "code",     "count": 100}', 'rare',      '💻'),
  ('Bug Slayer',      '消滅 50 個 bug。牠們見你就逃。',                           'category_count', '{"category": "fix",      "count": 50}',  'rare',      '🪲'),
  ('Shipmaster',      '完成 20 次部署。每次都是一場賭注，你每次都贏了。',           'category_count', '{"category": "deploy",   "count": 20}',  'epic',      '🚀'),
  ('Test Knight',     '品質的守護者，完成 100 項測試成就。',                       'category_count', '{"category": "test",     "count": 100}', 'rare',      '🧪'),
  ('Doc Wizard',      '那個真的會寫文件的人。完成 30 項文件成就。',                 'category_count', '{"category": "docs",     "count": 30}',  'uncommon',  '📝'),
  ('Clean Coder',     '重構 50 次。讓程式碼比你找到它時更乾淨。',                   'category_count', '{"category": "refactor", "count": 50}',  'uncommon',  '🔧'),
  ('Code Whisperer',  '完成 30 次 code review。你的眼睛是團隊的防線。',           'category_count', '{"category": "review",   "count": 30}',  'uncommon',  '👁'),
  ('Ops Wizard',      '完成 30 項維運任務。系統不當機是因為有你。',                 'category_count', '{"category": "ops",      "count": 30}',  'rare',      '⚙️'),
  -- Knowledge
  ('Lifelong Learner','完成 200 項學習成就。知識是你唯一不會折舊的資產。',           'category_count', '{"category": "learn",    "count": 200}', 'epic',      '📚'),
  -- Milestones
  ('Legend Maker',    '達成 10 個里程碑。你不只做事，你創造歷史。',                  'category_count', '{"category": "milestone","count": 10}',  'legendary', '🏆'),
  -- Life
  ('Life Juggler',    '在生活類別完成 100 件事。把日常瑣事變成成就本身。',          'category_count', '{"category": "life",     "count": 100}', 'rare',      '🏠'),
  ('Iron Body',       '完成 150 項健康成就。你的身體是最重要的基礎設施。',           'category_count', '{"category": "health",   "count": 150}', 'epic',      '💪'),
  ('Money Monk',      '完成 50 項財務成就。金錢是工具，你掌握了它。',               'category_count', '{"category": "finance",  "count": 50}',  'uncommon',  '💰'),
  ('Connector',       '完成 80 項社交成就。你讓周圍的人變得更好。',                 'category_count', '{"category": "social",   "count": 80}',  'uncommon',  '🤝'),
  ('Creator',         '完成 50 項創作成就。你把腦中的東西帶到了世界上。',           'category_count', '{"category": "creative", "count": 50}',  'rare',      '🎨'),
  -- New categories
  ('Inner Sage',      '完成 30 項身心靈成就。你在探索別人忽略的那個維度。',          'category_count', '{"category": "spiritual","count": 30}',  'uncommon',  '🔮'),
  ('Enthusiast',      '完成 100 項興趣娛樂成就。認真玩也是一種才能。',              'category_count', '{"category": "hobby",    "count": 100}', 'uncommon',  '🎮');

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
