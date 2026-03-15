'use client';

import { useLocale } from '@/components/locale-provider';
import { t } from '@/lib/i18n';

type Achievement = {
  id: string;
  category: string;
  title: string;
  description: string;
  xp: number;
  recorded_at: string;
};

type Profile = {
  display_name?: string | null;
  username: string;
  avatar_url?: string | null;
  bio?: string | null;
  birth_date?: string | null;
  total_xp?: number | null;
  year_xp?: number | null;
  current_streak?: number | null;
};

type ActiveTitle = { name: string; rarity: string } | null;

type Props = {
  profile: Profile;
  achievements: Achievement[] | null;
  activeTitle: ActiveTitle;
  topCategories: [string, number][];
  totalCount: number;
  titlesCount: number | null;
  ageLevel: number | string;
};

const rarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return 'text-yellow-400';
    case 'epic':      return 'text-purple-400';
    case 'rare':      return 'text-blue-400';
    case 'uncommon':  return 'text-green-400';
    default:          return 'text-gray-400';
  }
};

const categoryEmoji: Record<string, string> = {
  code: '\u{1F4BB}', fix: '\u{1FAB2}', deploy: '\u{1F680}',
  test: '\u{1F9EA}', docs: '\u{1F4DD}', refactor: '\u{1F527}',
  review: '\u{1F440}', learn: '\u{1F4DA}', ops: '\u2699\uFE0F',
  milestone: '\u{1F3C6}', life: '\u{1F3E0}', health: '\u{1F4AA}',
  finance: '\u{1F4B0}', social: '\u{1F91D}', creative: '\u{1F3A8}',
};

export function ProfileClient({
  profile,
  achievements,
  activeTitle,
  topCategories,
  totalCount,
  titlesCount,
  ageLevel,
}: Props) {
  const { locale } = useLocale();
  const tr = t(locale).profile;

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* Profile Header */}
      <div className="mb-8 text-center">
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt={`${profile.display_name || profile.username}'s avatar`}
            className="mx-auto mb-4 h-24 w-24 rounded-full border-2 border-emerald-500"
          />
        )}
        <h1 className="text-3xl font-bold">
          {profile.display_name || profile.username}
          <span className="ml-2 text-emerald-400">Lv.{ageLevel}</span>
        </h1>
        {activeTitle && (
          <p className={`mt-1 text-sm font-medium ${rarityColor(activeTitle.rarity)}`}>
            {activeTitle.name}
          </p>
        )}
        {profile.bio && <p className="mt-2 text-gray-400">{profile.bio}</p>}
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid grid-cols-4 gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4 text-center">
        <div>
          <div className="text-2xl font-bold text-emerald-400">
            {profile.total_xp?.toLocaleString(locale) || 0}
          </div>
          <div className="text-xs text-gray-500">{tr.totalXp}</div>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {profile.year_xp?.toLocaleString(locale) || 0}
          </div>
          <div className="text-xs text-gray-500">{tr.yearXp}</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{profile.current_streak || 0}</div>
          <div className="text-xs text-gray-500">{tr.streak}</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{titlesCount || 0}</div>
          <div className="text-xs text-gray-500">{tr.titles}</div>
        </div>
      </div>

      {/* Category Breakdown */}
      {topCategories.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">{tr.categoryBreakdown}</h2>
          <div className="space-y-2">
            {topCategories.map(([cat, count]) => {
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="w-6 text-center">{categoryEmoji[cat] || '\u{1F4CC}'}</span>
                  <span className="w-20 text-sm text-gray-400">{cat}</span>
                  <div className="h-2 flex-1 rounded-full bg-gray-800">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm text-gray-500">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      <h2 className="mb-3 text-lg font-semibold">{tr.recentAchievements}</h2>
      {achievements && achievements.length > 0 ? (
        <div className="space-y-3">
          {achievements.map((a) => (
            <div key={a.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="mr-2">{categoryEmoji[a.category] || '\u{1F4CC}'}</span>
                  <span className="font-medium">{a.title}</span>
                  <span className="ml-2 rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                    {a.category}
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-400">+{a.xp} XP</span>
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
        <p className="py-8 text-center text-gray-500">{tr.noPublicAchievements}</p>
      )}
    </main>
  );
}
