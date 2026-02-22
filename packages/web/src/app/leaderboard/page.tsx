import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import type { Metadata } from 'next';

// Anon client for public pages (no cookie-based auth needed)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export const metadata: Metadata = {
  title: 'Leaderboard | LevelUp.log',
  description: 'See who is earning the most XP on LevelUp.log',
};

export const revalidate = 300;

export default async function LeaderboardPage({ searchParams }: Props) {
  const { type: rawType } = await searchParams;
  const type = rawType || 'all_time';

  let entries: Array<{
    rank: number;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    xp: number;
  }> = [];

  if (type === 'season') {
    const { data: season } = await supabase
      .from('seasons')
      .select('id, name')
      .eq('is_active', true)
      .single();

    if (season) {
      const { data } = await supabase
        .from('season_participants')
        .select('season_xp, profiles(username, display_name, avatar_url)')
        .eq('season_id', season.id)
        .order('season_xp', { ascending: false })
        .limit(50);

      entries = (data || []).map((p: any, i: number) => ({
        rank: i + 1,
        username: p.profiles?.username || 'unknown',
        display_name: p.profiles?.display_name,
        avatar_url: p.profiles?.avatar_url,
        xp: p.season_xp,
      }));
    }
  } else {
    const xpField = type === 'month' ? 'year_xp' : 'total_xp';
    const { data } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url, total_xp, year_xp')
      .order(xpField, { ascending: false })
      .limit(50);

    entries = (data || []).map((p: any, i: number) => ({
      rank: i + 1,
      username: p.username,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      xp: type === 'month' ? p.year_xp : p.total_xp,
    }));
  }

  const tabs = [
    { key: 'season', label: 'Season' },
    { key: 'month', label: 'This Year' },
    { key: 'all_time', label: 'All Time' },
  ];

  const medalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-500';
  };

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Leaderboard</h1>

      {/* Type Tabs */}
      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/leaderboard?type=${tab.key}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              type === tab.key
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Leaderboard Table */}
      {entries.length > 0 ? (
        <div className="space-y-2">
          {entries.map((entry) => (
            <Link
              key={entry.username}
              href={`/u/${entry.username}`}
              className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4 transition hover:border-gray-700"
            >
              <span
                className={`w-8 text-center text-lg font-bold ${medalColor(entry.rank)}`}
              >
                {entry.rank <= 3
                  ? ['\u{1F947}', '\u{1F948}', '\u{1F949}'][entry.rank - 1]
                  : `#${entry.rank}`}
              </span>
              {entry.avatar_url ? (
                <img
                  src={entry.avatar_url}
                  alt={`${entry.display_name || entry.username}'s avatar`}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-500">
                  {(entry.display_name || entry.username)?.[0]?.toUpperCase() ||
                    '?'}
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium">
                  {entry.display_name || entry.username}
                </div>
                <div className="text-xs text-gray-500">@{entry.username}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-400">
                  {entry.xp.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">XP</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-800 p-8 text-center text-gray-500">
          <p>No entries yet. Be the first!</p>
        </div>
      )}
    </main>
  );
}
