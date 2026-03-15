// Shared title unlock logic — called by both record-achievement and check-unlocks.
//
// Uses get_category_counts() RPC (GROUP BY on indexed column) instead of
// fetching all achievement rows and counting in JS.

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export type TitleRow = {
  id: string;
  name: string;
  description: string;
  requirement_type: string;
  requirement_value: Record<string, unknown>;
  rarity: string;
  icon: string | null;
};

export type UnlockResult = {
  newly_unlocked: TitleRow[];
  progress: Array<{ title: TitleRow; current: number; required: number }>;
};

export async function checkAndUnlockTitles(
  supabase: SupabaseClient,
  userId: string,
  profile: { total_xp: number; year_xp: number; current_streak: number },
): Promise<UnlockResult> {
  // 1. Already-unlocked IDs
  const { data: unlocked } = await supabase
    .from('user_titles')
    .select('title_id')
    .eq('user_id', userId);

  const unlockedIds = new Set((unlocked ?? []).map((t: { title_id: string }) => t.title_id));

  // 2. All title definitions
  const { data: allTitles } = await supabase
    .from('title_definitions')
    .select('*');

  // 3. Category counts via RPC — O(log n) using idx_achievements_category
  const { data: catRows } = await supabase
    .rpc('get_category_counts', { p_user_id: userId });

  const categoryCounts: Record<string, number> = {};
  for (const row of catRows ?? []) {
    categoryCounts[row.category] = Number(row.cnt);
  }

  const newlyUnlocked: TitleRow[] = [];
  const progress: UnlockResult['progress'] = [];

  for (const title of (allTitles ?? []) as TitleRow[]) {
    if (unlockedIds.has(title.id)) continue;

    const req = title.requirement_value;
    let met = false;
    let current = 0;
    let required = 0;

    switch (title.requirement_type) {
      case 'total_xp':
        required = (req.min_xp as number) ?? 0;
        current = profile.total_xp;
        met = current >= required;
        break;

      case 'year_xp':
        required = (req.min_xp as number) ?? 0;
        current = profile.year_xp;
        met = current >= required;
        break;

      case 'category_count':
        required = (req.count as number) ?? 0;
        current = categoryCounts[req.category as string] ?? 0;
        met = current >= required;
        break;

      case 'streak':
        required = (req.days as number) ?? 0;
        current = profile.current_streak;
        met = current >= required;
        break;

      case 'special':
        // TODO: implement comeback / other special logic
        break;
    }

    if (met) {
      newlyUnlocked.push(title);
      await supabase.from('user_titles').insert({
        user_id: userId,
        title_id: title.id,
      });
    } else if (required > 0) {
      progress.push({ title, current, required });
    }
  }

  // Sort progress by closest to completion (descending)
  progress.sort((a, b) => b.current / b.required - a.current / a.required);

  return {
    newly_unlocked: newlyUnlocked,
    progress: progress.slice(0, 5),
  };
}
