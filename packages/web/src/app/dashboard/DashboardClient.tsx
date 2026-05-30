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

type MomentumStats = {
  momentum_score?: number;
  initiation_score?: number;
  completion_score?: number;
  recovery_score?: number;
  focus_score?: number;
  quests_started?: number;
  quests_completed?: number;
  rough_versions_count?: number;
  returned_count?: number;
  anti_tasks_stopped?: number;
} | null;

type Quest = {
  id: string;
  quest_type: 'normal' | 'rough_version' | 'anti_task';
  status: 'planned' | 'started' | 'rough_done' | 'completed' | 'abandoned' | 'expired';
  summary: string;
  minimum_done_standard?: string | null;
  blocker_type?: string | null;
  timebox_minutes?: number | null;
  quantity_limit?: number | null;
  updated_at: string;
};

type Props = {
  profile: Profile | null;
  achievements: Achievement[] | null;
  activeTitle: ActiveTitle;
  ageLevel: number | string;
  momentumStats: MomentumStats;
  activeQuests: Quest[] | null;
};

const questTypeLabel = (type: Quest['quest_type'], zh: boolean) => {
  if (zh) {
    if (type === 'rough_version') return '爛版本任務';
    if (type === 'anti_task') return '反向任務';
    return '一般任務';
  }
  if (type === 'rough_version') return 'Rough Version';
  if (type === 'anti_task') return 'Reverse Task';
  return 'Quest';
};

const statusLabel = (status: Quest['status'], zh: boolean) => {
  const zhMap: Record<Quest['status'], string> = {
    planned: '想做',
    started: '已開始',
    rough_done: '爛版本',
    completed: '完成',
    abandoned: '放棄',
    expired: '過期',
  };
  const enMap: Record<Quest['status'], string> = {
    planned: 'Planned',
    started: 'Started',
    rough_done: 'Rough Draft',
    completed: 'Done',
    abandoned: 'Dropped',
    expired: 'Expired',
  };
  return zh ? zhMap[status] : enMap[status];
};

const blockerLabel = (blocker?: string | null) => {
  const labels: Record<string, string> = {
    perfectionism: '完美主義',
    unclear_next_step: '下一步不清楚',
    too_large: '任務太大',
    fear_of_judgment: '害怕被評價',
    low_energy: '低能量',
    avoidance_loop: '逃避循環',
    other: '其他',
  };
  return blocker ? labels[blocker] || blocker : null;
};

function SkillBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="font-medium text-gray-100">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-800">
        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function DashboardClient({
  profile,
  achievements,
  activeTitle,
  ageLevel,
  momentumStats,
  activeQuests,
}: Props) {
  const { locale } = useLocale();
  const tr = t(locale).dashboard;
  const cmn = t(locale).common;
  const zh = locale.startsWith('zh');
  const copy = zh
    ? {
        momentum: '抗拖延 Momentum',
        mirror: '這裡只顯示你和 LLM 對話中被捕捉到的行動軌跡。',
        initiation: '啟動力',
        completion: '收尾力',
        recovery: '回復力',
        focus: '專注力',
        quests: 'Active Quest 鏡像',
        noQuests: '目前沒有進行中的 Quest。下次你在 LLM 裡說「我想做但不想開始」時，它會自動出現在這裡。',
        doneStandard: '最小完成標準',
        blocker: '卡住原因',
      }
    : {
        momentum: 'Anti-Procrastination Momentum',
        mirror: 'A read-only mirror of progress captured from your LLM conversations.',
        initiation: 'Initiation',
        completion: 'Completion',
        recovery: 'Recovery',
        focus: 'Focus',
        quests: 'Active Quest Mirror',
        noQuests: 'No active quests yet. When you tell your LLM you want to do something but feel stuck, it will show up here.',
        doneStandard: 'Minimum done standard',
        blocker: 'Blocker',
      };
  const skillMax = Math.max(
    1,
    momentumStats?.initiation_score || 0,
    momentumStats?.completion_score || 0,
    momentumStats?.recovery_score || 0,
    momentumStats?.focus_score || 0,
  );

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
            href="/dashboard/diary"
            className="text-sm text-emerald-400 hover:underline"
          >
            {tr.diary}
          </Link>
          <Link
            href="/dashboard/settings"
            className="text-sm text-gray-400 hover:text-white"
          >
            {tr.settings}
          </Link>
        </div>
      </div>

      {/* Momentum Panel */}
      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{copy.momentum}</h2>
            <p className="mt-1 text-sm text-gray-500">{copy.mirror}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-400">
              {(momentumStats?.momentum_score || 0).toLocaleString(locale)}
            </div>
            <div className="text-xs text-gray-500">Momentum</div>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SkillBar label={copy.initiation} value={momentumStats?.initiation_score || 0} max={skillMax} />
          <SkillBar label={copy.completion} value={momentumStats?.completion_score || 0} max={skillMax} />
          <SkillBar label={copy.recovery} value={momentumStats?.recovery_score || 0} max={skillMax} />
          <SkillBar label={copy.focus} value={momentumStats?.focus_score || 0} max={skillMax} />
        </div>
        <div className="mt-5 grid grid-cols-4 gap-3 text-center text-sm">
          <div>
            <div className="font-bold">{momentumStats?.rough_versions_count || 0}</div>
            <div className="text-xs text-gray-500">{zh ? '爛版本' : 'Rough'}</div>
          </div>
          <div>
            <div className="font-bold">{momentumStats?.returned_count || 0}</div>
            <div className="text-xs text-gray-500">{zh ? '回頭' : 'Returns'}</div>
          </div>
          <div>
            <div className="font-bold">{momentumStats?.quests_started || 0}</div>
            <div className="text-xs text-gray-500">{zh ? '開始' : 'Started'}</div>
          </div>
          <div>
            <div className="font-bold">{momentumStats?.quests_completed || 0}</div>
            <div className="text-xs text-gray-500">{zh ? '完成' : 'Done'}</div>
          </div>
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
              {profile?.display_name || profile?.username || cmn.adventurer}
              <span className="ml-2 text-emerald-400">{cmn.lv}{ageLevel}</span>
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

      {/* Active Quest Mirror */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold">{copy.quests}</h3>
        {activeQuests && activeQuests.length > 0 ? (
          <div className="grid gap-3">
            {activeQuests.map((quest) => (
              <div key={quest.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium">{quest.summary}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-400">
                      <span className="rounded bg-gray-800 px-2 py-0.5">
                        {questTypeLabel(quest.quest_type, zh)}
                      </span>
                      <span className="rounded bg-gray-800 px-2 py-0.5">
                        {statusLabel(quest.status, zh)}
                      </span>
                      {quest.timebox_minutes ? (
                        <span className="rounded bg-gray-800 px-2 py-0.5">
                          {quest.timebox_minutes}m
                        </span>
                      ) : null}
                      {quest.quantity_limit ? (
                        <span className="rounded bg-gray-800 px-2 py-0.5">
                          x{quest.quantity_limit}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <time className="text-xs text-gray-600">
                    {new Date(quest.updated_at).toLocaleDateString(locale, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
                {quest.minimum_done_standard && (
                  <p className="mt-3 text-sm text-gray-400">
                    {copy.doneStandard}: {quest.minimum_done_standard}
                  </p>
                )}
                {blockerLabel(quest.blocker_type) && (
                  <p className="mt-1 text-sm text-gray-500">
                    {copy.blocker}: {blockerLabel(quest.blocker_type)}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-800 p-6 text-center text-sm text-gray-500">
            {copy.noQuests}
          </div>
        )}
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
                    {cmn.categories[a.category as keyof typeof cmn.categories] || a.category}
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
