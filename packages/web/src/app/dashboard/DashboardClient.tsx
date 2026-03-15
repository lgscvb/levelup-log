'use client';

import Link from 'next/link';
import { useLocale } from '@/components/locale-provider';
import { t } from '@/lib/i18n';

type Achievement = {
  id: string;
  title: string;
  category: string;
  description: string;
  xp: number;
  recorded_at: string;
};

type Profile = {
  username?: string;
  display_name?: string;
  avatar_url?: string;
  total_xp?: number;
  year_xp?: number;
  current_streak?: number;
  longest_streak?: number;
  active_title_id?: string;
};

type ActiveTitle = {
  name: string;
  rarity: string;
} | null;

type Props = {
  profile: Profile | null;
  achievements: Achievement[] | null;
  activeTitle: ActiveTitle;
  ageLevel: number | string;
};

export function DashboardClient({ profile, achievements, activeTitle, ageLevel }: Props) {
  const { locale } = useLocale();
  const tr = t(locale).dashboard;

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{tr.title}</h1>
        <div className="flex gap-3">
          {profile?.username && (
            <Link
              href={`/u/${profile.username}`}
              className="text-sm text-emerald-400 hover:underline"
            >
              {tr.publicProfile}
            </Link>
          )}
          <Link
            href="/dashboard/settings"
            className="text-sm text-gray-400 hover:text-white"
          >
            {tr.settings}
          </Link>
        </div>
      </div>

      {/* Stats Card */}
      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center gap-4">
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-16 w-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-bold">
              {profile?.display_name || profile?.username || 'Adventurer'}
              <span className="ml-2 text-emerald-400">Lv.{ageLevel}</span>
            </h2>
            {activeTitle && (
              <span
                className={`text-sm ${
                  activeTitle.rarity === 'legendary'
                    ? 'text-yellow-400'
                    : activeTitle.rarity === 'epic'
                      ? 'text-purple-400'
                      : activeTitle.rarity === 'rare'
                        ? 'text-blue-400'
                        : 'text-gray-400'
                }`}
              >
                {activeTitle.name}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-400">
              {profile?.total_xp?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-500">{tr.totalXp}</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {profile?.year_xp?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-500">{tr.yearXp}</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {profile?.current_streak || 0}
            </div>
            <div className="text-xs text-gray-500">{tr.streak}</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {profile?.longest_streak || 0}
            </div>
            <div className="text-xs text-gray-500">{tr.bestStreak}</div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <h3 className="mb-4 text-lg font-semibold">{tr.recentAchievements}</h3>
      {achievements && achievements.length > 0 ? (
        <div className="space-y-3">
          {achievements.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-gray-800 bg-gray-900/50 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{a.title}</span>
                  <span className="ml-2 rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                    {a.category}
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-400">
                  +{a.xp} XP
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-400">{a.description}</p>
              <time className="mt-1 block text-xs text-gray-600">
                {new Date(a.recorded_at).toLocaleDateString(locale, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-800 p-8 text-center text-gray-500">
          <p>{tr.noAchievements}</p>
          <code className="mt-2 block text-sm text-emerald-400">
            npx @levelup-log/mcp-server init
          </code>
        </div>
      )}
    </main>
  );
}
