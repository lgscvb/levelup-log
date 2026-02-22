import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Anon client for public pages (no cookie-based auth needed)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, total_xp, birth_date")
    .eq("username", slug)
    .single();

  if (!profile) return { title: "User Not Found" };

  const age = profile.birth_date
    ? Math.floor(
        (Date.now() - new Date(profile.birth_date).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      )
    : null;

  return {
    title: `${profile.display_name || profile.username} — Lv.${age || "?"} | LevelUp.log`,
    description: `${profile.display_name || profile.username} has earned ${profile.total_xp?.toLocaleString() || 0} XP on LevelUp.log`,
    openGraph: {
      title: `${profile.display_name || profile.username} — Lv.${age || "?"}`,
      description: `${profile.total_xp?.toLocaleString() || 0} XP earned`,
      type: "profile",
      images: [`/api/og/${slug}`],
    },
  };
}

export const revalidate = 60;

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", slug)
    .single();

  if (!profile) notFound();

  // Fetch active title
  const activeTitle = profile.active_title_id
    ? (
        await supabase
          .from("title_definitions")
          .select("name, rarity")
          .eq("id", profile.active_title_id)
          .single()
      ).data
    : null;

  // Fetch public achievements (last 20) -- RLS + is_public filter
  const { data: achievements } = await supabase
    .from("achievements")
    .select("id, category, title, description, xp, recorded_at")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("recorded_at", { ascending: false })
    .limit(20);

  // Category breakdown (all achievements for this user visible via RLS)
  const { data: categoryStats } = await supabase
    .from("achievements")
    .select("category")
    .eq("user_id", profile.id);

  const categoryBreakdown: Record<string, number> = {};
  (categoryStats || []).forEach((a: { category: string }) => {
    categoryBreakdown[a.category] = (categoryBreakdown[a.category] || 0) + 1;
  });
  const totalCount = Object.values(categoryBreakdown).reduce(
    (sum, c) => sum + c,
    0,
  );
  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Unlocked titles count
  const { count: titlesCount } = await supabase
    .from("user_titles")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id);

  const ageLevel = profile.birth_date
    ? Math.floor(
        (Date.now() - new Date(profile.birth_date).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      )
    : "?";

  // Rarity color helper
  const rarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "text-yellow-400";
      case "epic":
        return "text-purple-400";
      case "rare":
        return "text-blue-400";
      case "uncommon":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  // Category emoji mapping
  const categoryEmoji: Record<string, string> = {
    code: "\u{1F4BB}",
    fix: "\u{1FAB2}",
    deploy: "\u{1F680}",
    test: "\u{1F9EA}",
    docs: "\u{1F4DD}",
    refactor: "\u{1F527}",
    review: "\u{1F440}",
    learn: "\u{1F4DA}",
    ops: "\u2699\uFE0F",
    milestone: "\u{1F3C6}",
    life: "\u{1F3E0}",
    health: "\u{1F4AA}",
    finance: "\u{1F4B0}",
    social: "\u{1F91D}",
    creative: "\u{1F3A8}",
  };

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
          <p
            className={`mt-1 text-sm font-medium ${rarityColor(activeTitle.rarity)}`}
          >
            {activeTitle.name}
          </p>
        )}
        {profile.bio && <p className="mt-2 text-gray-400">{profile.bio}</p>}
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid grid-cols-4 gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4 text-center">
        <div>
          <div className="text-2xl font-bold text-emerald-400">
            {profile.total_xp?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-gray-500">Total XP</div>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {profile.year_xp?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-gray-500">Year XP</div>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {profile.current_streak || 0}
          </div>
          <div className="text-xs text-gray-500">Streak</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{titlesCount || 0}</div>
          <div className="text-xs text-gray-500">Titles</div>
        </div>
      </div>

      {/* Category Breakdown */}
      {topCategories.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Category Breakdown</h2>
          <div className="space-y-2">
            {topCategories.map(([cat, count]) => {
              const pct =
                totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="w-6 text-center">
                    {categoryEmoji[cat] || "\u{1F4CC}"}
                  </span>
                  <span className="w-20 text-sm text-gray-400">{cat}</span>
                  <div className="h-2 flex-1 rounded-full bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm text-gray-500">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      <h2 className="mb-3 text-lg font-semibold">Recent Achievements</h2>
      {achievements && achievements.length > 0 ? (
        <div className="space-y-3">
          {achievements.map(
            (a: {
              id: string;
              category: string;
              title: string;
              description: string;
              xp: number;
              recorded_at: string;
            }) => (
              <div
                key={a.id}
                className="rounded-lg border border-gray-800 bg-gray-900/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="mr-2">
                      {categoryEmoji[a.category] || "\u{1F4CC}"}
                    </span>
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
                  {new Date(a.recorded_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            ),
          )}
        </div>
      ) : (
        <p className="py-8 text-center text-gray-500">
          No public achievements yet.
        </p>
      )}
    </main>
  );
}
