import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProfileClient } from "./ProfileClient";

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

  return (
    <ProfileClient
      profile={profile}
      achievements={achievements}
      activeTitle={activeTitle}
      topCategories={topCategories}
      totalCount={totalCount}
      titlesCount={titlesCount}
      ageLevel={ageLevel}
    />
  );
}
