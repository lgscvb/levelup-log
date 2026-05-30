import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { LeaderboardClient } from "./LeaderboardClient";

// Anon client for public pages (no cookie-based auth needed)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export const metadata: Metadata = {
  title: "Leaderboard | LevelUp.log",
  description: "See who is earning the most XP on LevelUp.log",
};

export const revalidate = 300;

export default async function LeaderboardPage({ searchParams }: Props) {
  const { type: rawType } = await searchParams;
  const type = rawType || "all_time";

  let entries: Array<{
    rank: number;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    xp: number;
  }> = [];

  if (type === "season") {
    const { data: season } = await supabase
      .from("seasons")
      .select("id, name")
      .eq("is_active", true)
      .single();

    if (season) {
      const { data } = await supabase
        .from("season_participants")
        .select("season_xp, profiles(username, display_name, avatar_url)")
        .eq("season_id", season.id)
        .order("season_xp", { ascending: false })
        .limit(50);

      entries = (data || []).map((p: any, i: number) => ({
        rank: i + 1,
        username: p.profiles?.username || "unknown",
        display_name: p.profiles?.display_name,
        avatar_url: p.profiles?.avatar_url,
        xp: p.season_xp,
      }));
    }
  } else if (["momentum", "initiation", "completion", "recovery"].includes(type)) {
    const metricField: Record<string, string> = {
      momentum: "momentum_score",
      initiation: "initiation_score",
      completion: "completion_score",
      recovery: "recovery_score",
    };
    const scoreField = metricField[type] || "momentum_score";
    const { data } = await supabase
      .from("user_momentum_stats")
      .select(
        "user_id, momentum_score, initiation_score, completion_score, recovery_score, profiles(username, display_name, avatar_url)",
      )
      .order(scoreField, { ascending: false })
      .limit(50);

    entries = (data || []).map((s: any, i: number) => ({
      rank: i + 1,
      username: s.profiles?.username || "unknown",
      display_name: s.profiles?.display_name,
      avatar_url: s.profiles?.avatar_url,
      xp: s[scoreField] || 0,
    }));
  } else {
    const xpField = type === "month" ? "year_xp" : "total_xp";
    const { data } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url, total_xp, year_xp")
      .order(xpField, { ascending: false })
      .limit(50);

    entries = (data || []).map((p: any, i: number) => ({
      rank: i + 1,
      username: p.username,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      xp: type === "month" ? p.year_xp : p.total_xp,
    }));
  }

  return <LeaderboardClient entries={entries} type={type} />;
}
