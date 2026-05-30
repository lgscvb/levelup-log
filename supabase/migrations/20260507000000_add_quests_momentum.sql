-- LevelUp.log v2: LLM-native anti-procrastination quests

CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_type TEXT NOT NULL DEFAULT 'normal'
    CHECK (quest_type IN ('normal', 'rough_version', 'anti_task')),
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'started', 'rough_done', 'completed', 'abandoned', 'expired')),
  summary TEXT NOT NULL,
  minimum_done_standard TEXT,
  blocker_type TEXT
    CHECK (
      blocker_type IS NULL OR blocker_type IN (
        'perfectionism',
        'unclear_next_step',
        'too_large',
        'fear_of_judgment',
        'low_energy',
        'avoidance_loop',
        'other'
      )
    ),
  timebox_minutes INTEGER CHECK (timebox_minutes IS NULL OR timebox_minutes > 0),
  quantity_limit INTEGER CHECK (quantity_limit IS NULL OR quantity_limit > 0),
  public_summary TEXT NOT NULL DEFAULT 'A quest moved forward.',
  is_public BOOLEAN DEFAULT true,
  source_platform TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quest_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL
    CHECK (
      event_type IN (
        'intent',
        'blocked',
        'started',
        'rough_done',
        'anti_started',
        'anti_stopped',
        'insight_recorded',
        'returned',
        'completed',
        'abandoned'
      )
    ),
  summary TEXT NOT NULL,
  momentum_delta INTEGER NOT NULL DEFAULT 0,
  initiation_delta INTEGER NOT NULL DEFAULT 0,
  completion_delta INTEGER NOT NULL DEFAULT 0,
  recovery_delta INTEGER NOT NULL DEFAULT 0,
  focus_delta INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_momentum_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  momentum_score INTEGER NOT NULL DEFAULT 0,
  initiation_score INTEGER NOT NULL DEFAULT 0,
  completion_score INTEGER NOT NULL DEFAULT 0,
  recovery_score INTEGER NOT NULL DEFAULT 0,
  focus_score INTEGER NOT NULL DEFAULT 0,
  quests_started INTEGER NOT NULL DEFAULT 0,
  quests_completed INTEGER NOT NULL DEFAULT 0,
  rough_versions_count INTEGER NOT NULL DEFAULT 0,
  returned_count INTEGER NOT NULL DEFAULT 0,
  anti_tasks_stopped INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quests_user_status ON quests(user_id, status, updated_at DESC);
CREATE INDEX idx_quests_public ON quests(is_public, updated_at DESC);
CREATE INDEX idx_quest_events_user_created ON quest_events(user_id, created_at DESC);
CREATE INDEX idx_quest_events_quest_created ON quest_events(quest_id, created_at DESC);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_momentum_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quests" ON quests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quests" ON quests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests" ON quests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quest events" ON quest_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quest events" ON quest_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Momentum stats are public" ON user_momentum_stats FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own momentum stats" ON user_momentum_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own momentum stats" ON user_momentum_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE OR REPLACE VIEW public_quest_summaries AS
SELECT
  q.id,
  q.user_id,
  p.username,
  q.quest_type,
  q.status,
  q.public_summary,
  q.created_at,
  q.updated_at
FROM quests q
JOIN profiles p ON p.id = q.user_id
WHERE q.is_public = true;

GRANT SELECT ON public_quest_summaries TO anon, authenticated;
