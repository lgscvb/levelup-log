-- LevelUp.log Initial Schema
-- Tables: profiles, yearly_snapshots, achievements, title_definitions,
--         user_titles, seasons, season_participants, follows, activity_feed

-- ─── title_definitions (must be created before profiles references it) ───
CREATE TABLE title_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value JSONB NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  icon TEXT,
  is_seasonal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── profiles ───────────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  birth_date DATE,
  total_xp BIGINT DEFAULT 0,
  year_xp BIGINT DEFAULT 0,
  active_title_id UUID REFERENCES title_definitions(id),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  stripe_customer_id TEXT,
  month_xp_used INTEGER DEFAULT 0,
  achievements_this_month INTEGER DEFAULT 0,
  default_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── yearly_snapshots ───────────────────────────────────────────
CREATE TABLE yearly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  age_level INTEGER NOT NULL,
  year_xp BIGINT NOT NULL,
  achievements_count INTEGER NOT NULL,
  top_categories JSONB,
  longest_streak INTEGER,
  titles_unlocked INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- ─── achievements ───────────────────────────────────────────────
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  xp INTEGER NOT NULL CHECK (xp BETWEEN 5 AND 500),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  source_platform TEXT,
  is_public BOOLEAN DEFAULT true,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_achievements_user_date ON achievements(user_id, recorded_at DESC);
CREATE INDEX idx_achievements_category ON achievements(user_id, category);

-- ─── user_titles ────────────────────────────────────────────────
CREATE TABLE user_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title_id UUID NOT NULL REFERENCES title_definitions(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, title_id)
);

-- ─── seasons ────────────────────────────────────────────────────
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── season_participants ────────────────────────────────────────
CREATE TABLE season_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons(id),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  season_xp BIGINT DEFAULT 0,
  final_rank INTEGER,
  UNIQUE(season_id, user_id)
);

-- ─── follows ────────────────────────────────────────────────────
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- ─── activity_feed ──────────────────────────────────────────────
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_feed_created ON activity_feed(created_at DESC);

-- ─── Helper function: age as level ──────────────────────────────
CREATE OR REPLACE FUNCTION get_age_level(bd DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM age(CURRENT_DATE, bd))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── Auto-create profile on signup ──────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'preferred_username', 'user_' || LEFT(NEW.id::text, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ─── RLS Policies ───────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Profiles: read public, update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Achievements: read public, insert own
CREATE POLICY "Public achievements are viewable" ON achievements FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User titles: read all, insert own
CREATE POLICY "Titles are viewable by everyone" ON user_titles FOR SELECT USING (true);
CREATE POLICY "Users can insert own titles" ON user_titles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Yearly snapshots: read own
CREATE POLICY "Users can view own snapshots" ON yearly_snapshots FOR SELECT USING (auth.uid() = user_id);

-- Season participants: read all
CREATE POLICY "Season participants are viewable" ON season_participants FOR SELECT USING (true);

-- Follows: read all, insert/delete own
CREATE POLICY "Follows are viewable" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Activity feed: read all public
CREATE POLICY "Activity feed is public" ON activity_feed FOR SELECT USING (true);
CREATE POLICY "System can insert activity" ON activity_feed FOR INSERT WITH CHECK (auth.uid() = user_id);
