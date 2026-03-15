/**
 * LevelUp.log Bi-Weekly Heartbeat Script
 *
 * 每兩週在本機執行一次，負責：
 *   1. 雙週報（用戶數、成就數、XP、熱門類別）
 *   2. Streak 健康檢查
 *   3. 賽季管理（結束過期賽季、自動建立下一季）
 *   4. 稱號分布報告
 *   5. 年度快照觸發（1/1 才執行）
 *   6. 結果寫入 Obsidian Vault
 *   7. Google 日曆事件
 *
 * 使用方式：
 *   LEVELUP_SERVICE_ROLE_KEY=xxx pnpm heartbeat
 *   crontab（每兩週一的早上 9 點）:
 *   0 9 * * 1 [ $(( $(date +\%V) \% 2 )) -eq 1 ] && LEVELUP_SERVICE_ROLE_KEY=xxx pnpm --filter mcp-server heartbeat
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { CONFIG } from "../utils/config.js";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatsResult = {
  totalUsers: number;
  activeThisWeek: number;
  weekAchievements: number;
  weekXp: number;
  topCategories: Array<{ cat: string; count: number }>;
};

type StreakResult = {
  healthy: number;
  atRisk: number;
  over30: number;
  over7: number;
};

type SeasonResult = {
  status: "active" | "expired_fixed" | "created" | "upcoming" | "none";
  name: string;
  daysLeft?: number;
  participants?: number;
  endsAt?: string;
};

type TitleEntry = {
  icon: string | null;
  name: string;
  rarity: string;
  unlockCount: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hr(char = "─", width = 60) {
  console.log(char.repeat(width));
}

function section(title: string) {
  console.log();
  hr();
  console.log(`  ${title}`);
  hr();
}

function pad(s: string | number, n: number) {
  return String(s).padEnd(n);
}

function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDatetime(iso: string) {
  return new Date(iso).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** ISO 8601 week number */
function getISOWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ─── Task 1: Weekly Stats ─────────────────────────────────────────────────────

async function weeklyStats(db: SupabaseClient): Promise<StatsResult> {
  section("📊 雙週報（過去 14 天）");

  const since = nDaysAgo(14);

  const { count: totalUsers } = await db
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { data: activeUsersData } = await db
    .from("achievements")
    .select("user_id")
    .gte("created_at", since);

  const activeThisWeek = new Set(activeUsersData?.map((r) => r.user_id)).size;

  const { data: weekAchievements } = await db
    .from("achievements")
    .select("xp, category")
    .gte("created_at", since);

  const weekCount = weekAchievements?.length ?? 0;
  const weekXp = weekAchievements?.reduce((sum, a) => sum + a.xp, 0) ?? 0;

  const catCounts: Record<string, number> = {};
  for (const a of weekAchievements ?? []) {
    catCounts[a.category] = (catCounts[a.category] ?? 0) + 1;
  }
  const topCategories = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, count]) => ({ cat, count }));

  console.log(`  👥 總用戶數：${totalUsers ?? 0}`);
  console.log(`  🔥 雙週活躍：${activeThisWeek} 人`);
  console.log(`  🏅 雙週成就：${weekCount} 項`);
  console.log(`  ⚡ 雙週 XP：${weekXp.toLocaleString()}`);

  if (topCategories.length > 0) {
    console.log();
    console.log("  本週熱門類別：");
    for (const { cat, count } of topCategories) {
      const bar = "█".repeat(
        Math.round((count / (topCategories[0].count || 1)) * 20),
      );
      console.log(`    ${pad(cat, 12)} ${pad(count, 4)} ${bar}`);
    }
  }

  return {
    totalUsers: totalUsers ?? 0,
    activeThisWeek,
    weekAchievements: weekCount,
    weekXp,
    topCategories,
  };
}

// ─── Task 2: Streak Health ────────────────────────────────────────────────────

async function streakHealth(db: SupabaseClient): Promise<StreakResult> {
  section("🔥 Streak 健康檢查");

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const { data: profiles } = await db
    .from("profiles")
    .select("current_streak, last_active_date")
    .gt("current_streak", 0);

  if (!profiles || profiles.length === 0) {
    console.log("  目前無活躍 streak");
    return { healthy: 0, atRisk: 0, over30: 0, over7: 0 };
  }

  let healthy = 0,
    atRisk = 0,
    over30 = 0,
    over7 = 0;

  for (const p of profiles) {
    const isHealthy =
      p.last_active_date === today || p.last_active_date === yesterdayStr;
    if (isHealthy) {
      healthy++;
      if (p.current_streak >= 30) over30++;
      else if (p.current_streak >= 7) over7++;
    } else {
      atRisk++;
    }
  }

  console.log(`  ✅ 健康 streak：${healthy} 人`);
  console.log(`     └── 30 天以上：${over30} 人`);
  console.log(`     └── 7-29 天：${over7} 人`);
  if (atRisk > 0) {
    console.log(`  ⚠️  streak 已中斷（待 cron 歸零）：${atRisk} 人`);
  }

  return { healthy, atRisk, over30, over7 };
}

// ─── Task 3: Season Management ────────────────────────────────────────────────

async function endSeason(
  db: SupabaseClient,
  season: { id: string; name: string },
) {
  const { data: participants } = await db
    .from("season_participants")
    .select("id, season_xp")
    .eq("season_id", season.id)
    .order("season_xp", { ascending: false });

  for (let i = 0; i < (participants ?? []).length; i++) {
    await db
      .from("season_participants")
      .update({ final_rank: i + 1 })
      .eq("id", participants![i].id);
  }

  await db.from("seasons").update({ is_active: false }).eq("id", season.id);
  console.log(
    `  ✅ 賽季「${season.name}」已結算，共 ${participants?.length ?? 0} 位`,
  );
}

async function createNextSeason(
  db: SupabaseClient,
  prev: { name: string; ends_at: string } | null,
) {
  const now = new Date();
  let seasonNum = 1;
  if (prev) {
    const match = prev.name.match(/S(\d+)/);
    if (match) seasonNum = parseInt(match[1]) + 1;
  }

  const startsAt = prev ? new Date(prev.ends_at) : now;
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + 90);

  const name = `S${String(seasonNum).padStart(2, "0")} - ${startsAt.getFullYear()} Q${Math.ceil((startsAt.getMonth() + 1) / 3)}`;

  const { data, error } = await db
    .from("seasons")
    .insert({
      name,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      is_active: !prev,
    })
    .select()
    .single();

  if (error) {
    console.log(`  ❌ 建立賽季失敗：${error.message}`);
  } else {
    console.log(`  ✅ 已建立賽季「${data.name}」`);
    console.log(
      `     ${formatDate(data.starts_at)} → ${formatDate(data.ends_at)}`,
    );
  }
}

async function seasonManagement(db: SupabaseClient): Promise<SeasonResult> {
  section("🏆 賽季管理");

  const now = new Date();
  const { data: seasons } = await db
    .from("seasons")
    .select("*")
    .order("starts_at", { ascending: false });

  if (!seasons || seasons.length === 0) {
    console.log("  ⚠️  尚無賽季資料，建立第一個賽季...");
    await createNextSeason(db, null);
    return { status: "created", name: "S01" };
  }

  const active = seasons.find((s) => s.is_active);

  if (active) {
    const endsAt = new Date(active.ends_at);
    const daysLeft = Math.ceil(
      (endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysLeft < 0) {
      console.log(
        `  ⏰ 賽季「${active.name}」已過期 ${-daysLeft} 天，正在結算...`,
      );
      await endSeason(db, active);
      await createNextSeason(db, active);
      return { status: "expired_fixed", name: active.name };
    }

    if (daysLeft <= 7) {
      console.log(
        `  ⚠️  賽季「${active.name}」還有 ${daysLeft} 天結束（${formatDate(active.ends_at)}）`,
      );
      const nextExists = seasons.some(
        (s) => !s.is_active && new Date(s.starts_at) > new Date(active.ends_at),
      );
      if (!nextExists) {
        console.log("  ➕ 預先建立下一個賽季...");
        await createNextSeason(db, active);
      }
    } else {
      console.log(`  ✅ 賽季「${active.name}」進行中`);
      console.log(
        `     ${formatDate(active.starts_at)} → ${formatDate(active.ends_at)}（還有 ${daysLeft} 天）`,
      );
    }

    const { count: participants } = await db
      .from("season_participants")
      .select("*", { count: "exact", head: true })
      .eq("season_id", active.id);

    console.log(`     參賽人數：${participants ?? 0} 人`);
    return {
      status: "active",
      name: active.name,
      daysLeft,
      participants: participants ?? 0,
      endsAt: active.ends_at,
    };
  }

  // 無活躍賽季
  const latest = seasons[0];
  if (latest && new Date(latest.starts_at) <= now) {
    console.log(`  ▶️  啟動賽季「${latest.name}」...`);
    await db.from("seasons").update({ is_active: true }).eq("id", latest.id);
    return { status: "active", name: latest.name };
  }

  console.log("  ⚠️  無活躍賽季");
  if (latest)
    console.log(
      `     「${latest.name}」將於 ${formatDatetime(latest.starts_at)} 開始`,
    );
  return { status: "none", name: "" };
}

// ─── Task 4: Title Distribution ───────────────────────────────────────────────

async function titleDistribution(db: SupabaseClient): Promise<TitleEntry[]> {
  section("🏅 稱號解鎖分布");

  const { data: titles } = await db
    .from("title_definitions")
    .select("id, name, rarity, icon");

  if (!titles || titles.length === 0) {
    console.log("  尚無稱號定義");
    return [];
  }

  const { data: unlocks } = await db.from("user_titles").select("title_id");

  const titleCounts: Record<string, number> = {};
  for (const u of unlocks ?? []) {
    titleCounts[u.title_id] = (titleCounts[u.title_id] ?? 0) + 1;
  }

  const rarityOrder = ["common", "uncommon", "rare", "epic", "legendary"];
  const sorted = [...titles].sort(
    (a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity),
  );

  const rarityEmoji: Record<string, string> = {
    common: "⚪",
    uncommon: "🟢",
    rare: "🔵",
    epic: "🟣",
    legendary: "🟡",
  };

  let currentRarity = "";
  for (const t of sorted) {
    if (t.rarity !== currentRarity) {
      currentRarity = t.rarity;
      console.log(`\n  ${rarityEmoji[t.rarity]} ${t.rarity.toUpperCase()}`);
    }
    const cnt = titleCounts[t.id] ?? 0;
    console.log(
      `    ${t.icon ?? "  "} ${pad(t.name, 18)} ${pad(cnt, 4)} 人解鎖`,
    );
  }

  return sorted.map((t) => ({
    icon: t.icon,
    name: t.name,
    rarity: t.rarity,
    unlockCount: titleCounts[t.id] ?? 0,
  }));
}

// ─── Task 5: Yearly Snapshot ──────────────────────────────────────────────────

async function yearlySnapshotIfNeeded(db: SupabaseClient) {
  const now = new Date();
  if (now.getMonth() !== 0 || now.getDate() !== 1) return;

  section("📅 年度快照（1/1 觸發）");
  const lastYear = now.getFullYear() - 1;

  const { data: profiles } = await db
    .from("profiles")
    .select("id, birth_date, year_xp, longest_streak");

  let ok = 0,
    err = 0;

  for (const p of profiles ?? []) {
    const ageLevel = p.birth_date
      ? Math.floor(
          (Date.now() - new Date(p.birth_date).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000),
        )
      : 0;

    const { count: achievementsCount } = await db
      .from("achievements")
      .select("*", { count: "exact", head: true })
      .eq("user_id", p.id)
      .gte("created_at", `${lastYear}-01-01`)
      .lt("created_at", `${lastYear + 1}-01-01`);

    const { data: catData } = await db
      .from("achievements")
      .select("category")
      .eq("user_id", p.id)
      .gte("created_at", `${lastYear}-01-01`)
      .lt("created_at", `${lastYear + 1}-01-01`);

    const catCounts: Record<string, number> = {};
    for (const a of catData ?? [])
      catCounts[a.category] = (catCounts[a.category] ?? 0) + 1;
    const topCategories = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));

    const { count: titlesUnlocked } = await db
      .from("user_titles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", p.id);

    const { error } = await db.from("yearly_snapshots").upsert(
      {
        user_id: p.id,
        year: lastYear,
        age_level: ageLevel,
        year_xp: p.year_xp,
        achievements_count: achievementsCount ?? 0,
        top_categories: topCategories,
        longest_streak: p.longest_streak,
        titles_unlocked: titlesUnlocked ?? 0,
      },
      { onConflict: "user_id,year", ignoreDuplicates: false },
    );
    if (error) err++;
    else ok++;
  }

  await db.from("profiles").update({ year_xp: 0, achievements_this_month: 0 });
  console.log(`  ✅ 年度快照：${ok} 人完成，${err} 個錯誤`);
  console.log("  ✅ year_xp 已歸零");
}

// ─── Task 6: Save to Obsidian ────────────────────────────────────────────────

async function saveToObsidian(
  stats: StatsResult,
  streak: StreakResult,
  season: SeasonResult,
  titles: TitleEntry[],
) {
  const now = new Date();
  const year = now.getFullYear();
  const week = getISOWeek(now);
  const dateStr = now.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const week2 = week + 1;
  const periodLabel = `${year}-W${String(week).padStart(2, "0")}-W${String(week2).padStart(2, "0")}`;

  const vaultDir = join(homedir(), "Documents/tai");
  const reportDir = join(vaultDir, "專案/LevelUp.log/雙週報");
  const fileName = `${periodLabel}.md`;
  const filePath = join(reportDir, fileName);

  // 稱號分布 markdown table
  const rarityOrder = ["common", "uncommon", "rare", "epic", "legendary"];
  const rarityLabel: Record<string, string> = {
    common: "⚪ Common",
    uncommon: "🟢 Uncommon",
    rare: "🔵 Rare",
    epic: "🟣 Epic",
    legendary: "🟡 Legendary",
  };
  const titlesByRarity = rarityOrder
    .map((r) => {
      const items = titles.filter((t) => t.rarity === r);
      if (items.length === 0) return "";
      const rows = items
        .map((t) => `| ${t.icon ?? "—"} | ${t.name} | ${t.unlockCount} |`)
        .join("\n");
      return `**${rarityLabel[r]}**\n\n| 圖示 | 稱號 | 解鎖人數 |\n|------|------|----------|\n${rows}`;
    })
    .filter(Boolean)
    .join("\n\n");

  // 熱門類別 markdown
  const catRows = stats.topCategories
    .map(({ cat, count }) => `| ${cat} | ${count} |`)
    .join("\n");
  const catTable =
    stats.topCategories.length > 0
      ? `| 類別 | 成就數 |\n|------|--------|\n${catRows}`
      : "_本週無記錄_";

  // 賽季狀態
  const seasonLine =
    season.status === "active"
      ? `${season.name}，還有 ${season.daysLeft} 天（${season.participants ?? 0} 位參賽者）`
      : season.status === "expired_fixed"
        ? `${season.name} 已結算，新賽季已建立`
        : season.status === "created"
          ? "已建立第一個賽季"
          : "無活躍賽季";

  const md = `---
public: false
date: ${now.toISOString().split("T")[0]}
tags: [levelup-log, 雙週報]
---

# LevelUp.log 雙週報 ${periodLabel}

> 產生時間：${dateStr}（涵蓋過去 14 天）

## 📊 雙週數據

| 指標 | 數值 |
|------|------|
| 總用戶數 | ${stats.totalUsers} |
| 雙週活躍 | ${stats.activeThisWeek} 人 |
| 雙週成就 | ${stats.weekAchievements} 項 |
| 雙週 XP | ${stats.weekXp.toLocaleString()} |

### 熱門類別

${catTable}

## 🔥 Streak 健康

| 指標 | 數值 |
|------|------|
| 健康 streak | ${streak.healthy} 人 |
| 30 天以上 | ${streak.over30} 人 |
| 7-29 天 | ${streak.over7} 人 |
| 已中斷（待歸零） | ${streak.atRisk} 人 |

## 🏆 賽季

${seasonLine}

## 🏅 稱號解鎖分布

${titlesByRarity || "_無稱號資料_"}
`;

  // 建立目錄（若不存在）
  mkdirSync(reportDir, { recursive: true });
  writeFileSync(filePath, md, "utf-8");

  console.log();
  console.log(
    `  📝 Obsidian 雙週報已儲存：專案/LevelUp.log/雙週報/${fileName}`,
  );
}

// ─── Task 7: Google Calendar Event ───────────────────────────────────────────

function saveToCalendar(
  stats: StatsResult,
  season: SeasonResult,
  week: number,
  year: number,
) {
  section("📅 Google 日曆");

  // 確認 gog 是否可用
  try {
    execSync("which gog", { stdio: "ignore" });
  } catch {
    console.log("  ⚠️  gog 未安裝，略過日曆整合");
    console.log("     安裝：brew install steipete/tap/gogcli");
    return;
  }

  const now = new Date();
  const todayDate = now.toISOString().split("T")[0];

  const w1 = String(week).padStart(2, "0");
  const w2 = String(week + 1).padStart(2, "0");
  const periodLabel = `${year}-W${w1}-W${w2}`;

  // 事件標題：雙週期間 + 關鍵數字
  const title = `LevelUp.log ${periodLabel} — ${stats.activeThisWeek} 活躍 · ${stats.weekAchievements} 成就 · ${stats.weekXp.toLocaleString()} XP`;

  // 事件開始 / 結束：今天 09:00–09:30（雙週報閱讀時間）
  const startTime = `${todayDate}T09:00`;
  const endTime = `${todayDate}T09:30`;

  // 事件描述（純文字）
  const topCatText = stats.topCategories
    .map(({ cat, count }) => `  ${cat}: ${count}`)
    .join("\n");

  const seasonText =
    season.status === "active"
      ? `${season.name}，還有 ${season.daysLeft} 天`
      : season.name || "無活躍賽季";

  const description =
    `LevelUp.log 雙週報 ${periodLabel}\n\n` +
    `用戶：${stats.totalUsers}  活躍：${stats.activeThisWeek}\n` +
    `成就：${stats.weekAchievements}  XP：${stats.weekXp.toLocaleString()}\n\n` +
    `熱門類別：\n${topCatText || "  （無）"}\n\n` +
    `賽季：${seasonText}\n\n` +
    `Obsidian：專案/LevelUp.log/雙週報/${periodLabel}.md`;

  try {
    execSync(
      `gog calendar create \
        --title ${JSON.stringify(title)} \
        --start "${startTime}" \
        --end "${endTime}" \
        --description ${JSON.stringify(description)} \
        --color 9`,
      { stdio: "pipe" },
    );
    console.log(`  ✅ 日曆事件已建立：${title}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  ❌ 日曆建立失敗：${msg.split("\n")[0]}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function main() {
  const serviceRoleKey =
    process.env.LEVELUP_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error("❌ 需要 LEVELUP_SERVICE_ROLE_KEY 環境變數");
    console.error("   export LEVELUP_SERVICE_ROLE_KEY=your_service_role_key");
    process.exit(1);
  }

  const db = createClient(CONFIG.SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const now = new Date();
  console.log();
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║         LevelUp.log Weekly Heartbeat                    ║");
  console.log(`║         ${now.toLocaleString("zh-TW").padEnd(50)}║`);
  console.log("╚══════════════════════════════════════════════════════════╝");

  const stats = await weeklyStats(db);
  const streak = await streakHealth(db);
  const season = await seasonManagement(db);
  const titles = await titleDistribution(db);

  await yearlySnapshotIfNeeded(db);
  await saveToObsidian(stats, streak, season, titles);
  saveToCalendar(stats, season, getISOWeek(now), now.getFullYear());

  section("✅ Heartbeat 完成");
  console.log();
}

// 直接以 tsx 執行時自動跑 main
const isDirectRun =
  process.argv[1]?.endsWith("heartbeat.ts") ||
  process.argv[1]?.endsWith("heartbeat.js");

if (isDirectRun) {
  main().catch((err) => {
    console.error("❌ Heartbeat 失敗：", err);
    process.exit(1);
  });
}
