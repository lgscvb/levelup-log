'use client';

import Link from 'next/link';
import { useLocale } from '@/components/locale-provider';
import { t } from '@/lib/i18n';

type Entry = {
  rank: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
};

type Props = {
  entries: Entry[];
  type: string;
};

const medalColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-gray-300';
  if (rank === 3) return 'text-amber-600';
  return 'text-gray-500';
};

export function LeaderboardClient({ entries, type }: Props) {
  const { locale } = useLocale();
  const tr = t(locale).leaderboard;

  const tabs = [
    { key: 'season', label: tr.season },
    { key: 'month', label: tr.thisYear },
    { key: 'all_time', label: tr.allTime },
  ];

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">{tr.title}</h1>

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
                  {(entry.display_name || entry.username)?.[0]?.toUpperCase() || '?'}
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
                  {entry.xp.toLocaleString(locale)}
                </div>
                <div className="text-xs text-gray-500">{tr.xp}</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-800 p-8 text-center text-gray-500">
          <p>{tr.noEntries}</p>
        </div>
      )}
    </main>
  );
}
