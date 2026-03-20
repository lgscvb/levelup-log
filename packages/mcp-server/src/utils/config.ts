import path from "node:path";
import os from "node:os";

export const CONFIG = {
  SUPABASE_URL:
    process.env.LEVELUP_SUPABASE_URL ||
    "https://hkuvfhfwbhkjmeqvwrxy.supabase.co",
  SUPABASE_ANON_KEY:
    process.env.LEVELUP_SUPABASE_ANON_KEY ||
    "sb_publishable_RilZivOWm3FIs6ueIA67Fw_07ZKjoEY",
  AUTH_PORT: parseInt(process.env.LEVELUP_AUTH_PORT || "19876", 10),
  DEBUG: process.env.LEVELUP_DEBUG === "true",
  DIARY_DIR: process.env.LEVELUP_DIARY_DIR || path.join(os.homedir(), ".levelup", "diary"),
} as const;

// ─── Category Definitions ────────────────────────────────────────────────────
// Single source of truth for all achievement categories.
// ACHIEVEMENT_CATEGORIES and AchievementCategory are derived from this object.
//
// xp_weight: category difficulty/verifiability multiplier applied to XP
//   >1.0 = higher stakes or harder (deploy, ops, fix)
//   1.0  = baseline (code, learn)
//   <1.0 = lighter or self-reported by nature (spiritual, hobby, social)
// ─────────────────────────────────────────────────────────────────────────────

export type CategoryDef = {
  label: string;       // Display name
  emoji: string;       // Visual identifier
  description: string; // What this category covers
  output_unit: string; // What 1 output_unit means for this category
  input_unit: string;  // What 1 input_unit means for this category
  xp_weight: number;   // Final XP multiplier (applied after base + bonuses)
};

export const CATEGORY_DEFINITIONS = {
  // ── Technical ──────────────────────────────────────────────────────────────
  code: {
    label: "Coding",
    emoji: "💻",
    description: "寫程式、功能開發、新增功能",
    output_unit: "檔案/模組（小函式=1, 大檔=5-10, 多組件=15）",
    input_unit: "檔案閱讀 / API 文件查閱",
    xp_weight: 1.0,
  },
  fix: {
    label: "Bug Fix",
    emoji: "🪲",
    description: "修 bug、修復錯誤行為",
    output_unit: "修復的 bug 數（含測試驗證 = +1）",
    input_unit: "錯誤日誌 / 程式碼追蹤",
    xp_weight: 1.1,
  },
  deploy: {
    label: "Deploy",
    emoji: "🚀",
    description: "部署上線、發布版本、推送 npm / App Store",
    output_unit: "部署目標數（1 服務/環境 = 1）",
    input_unit: "設定檔 / CI logs 查閱",
    xp_weight: 1.3,
  },
  test: {
    label: "Testing",
    emoji: "🧪",
    description: "寫測試、E2E、TDD",
    output_unit: "測試案例數（1 test case = 1）",
    input_unit: "待測程式碼閱讀",
    xp_weight: 1.0,
  },
  docs: {
    label: "Documentation",
    emoji: "📝",
    description: "寫文件、README、API 說明",
    output_unit: "頁數 / 章節數（1 完整段落 = 1）",
    input_unit: "參考資料 / 現有文件",
    xp_weight: 0.9,
  },
  refactor: {
    label: "Refactor",
    emoji: "🔧",
    description: "重構、改善程式碼品質",
    output_unit: "重構的模組/函式數",
    input_unit: "閱讀現有程式碼",
    xp_weight: 1.0,
  },
  review: {
    label: "Code Review",
    emoji: "👁",
    description: "Code review、PR 審查",
    output_unit: "審查的 PR / 檔案數",
    input_unit: "閱讀的程式碼（每 100 行 = 1）",
    xp_weight: 0.9,
  },
  ops: {
    label: "DevOps / Ops",
    emoji: "⚙️",
    description: "維運、基礎設施、監控、CI/CD",
    output_unit: "設定/腳本/服務數（1 完成項目 = 1）",
    input_unit: "日誌 / 文件查閱",
    xp_weight: 1.2,
  },
  // ── Knowledge ──────────────────────────────────────────────────────────────
  learn: {
    label: "Learning",
    emoji: "📚",
    description: "學習新知、閱讀技術文章、上課、語言學習",
    output_unit: "概念/章節/練習題（掌握 1 個新概念 = 1）",
    input_unit: "閱讀篇數 / 影片數",
    xp_weight: 1.0,
  },
  // ── Milestones ─────────────────────────────────────────────────────────────
  milestone: {
    label: "Milestone",
    emoji: "🏆",
    description: "里程碑、重大達成、特殊紀念",
    output_unit: "里程碑數（通常 = 1）",
    input_unit: "準備工作 / 研究",
    xp_weight: 1.5,
  },
  // ── Life ───────────────────────────────────────────────────────────────────
  life: {
    label: "Life",
    emoji: "🏠",
    description: "日常生活：家務、跑腿、育兒、採購、行政",
    output_unit: "完成的事項（跑腿=1, 帶小孩出門=2）",
    input_unit: "計畫 / 研究（查路線、比價等）",
    xp_weight: 0.9,
  },
  health: {
    label: "Health",
    emoji: "💪",
    description: "運動、飲食管理、就醫、健康習慣",
    output_unit: "30 分鐘運動塊 或 公里數 或 完成療程",
    input_unit: "查健康資料 / 追蹤記錄",
    xp_weight: 1.1,
  },
  finance: {
    label: "Finance",
    emoji: "💰",
    description: "記帳、投資、理財規劃、報稅、保險",
    output_unit: "完成的財務任務（1 項目 = 1）",
    input_unit: "研究報告 / 資料查閱",
    xp_weight: 1.0,
  },
  social: {
    label: "Social",
    emoji: "🤝",
    description: "社交、幫助他人、聚會、社群貢獻",
    output_unit: "互動的人數 或 完成的社交任務",
    input_unit: "準備 / 背景研究",
    xp_weight: 0.9,
  },
  creative: {
    label: "Creative",
    emoji: "🎨",
    description: "創作：寫文章、設計、音樂、影片、攝影",
    output_unit: "完成品（文章=3, 圖=1, 短影片=2）",
    input_unit: "參考資料 / 素材研究",
    xp_weight: 1.0,
  },
  spiritual: {
    label: "Spiritual",
    emoji: "🔮",
    description: "身心靈：冥想、占卜、祈禱、儀式、能量練習、內在探索",
    output_unit: "完成的練習（1 次冥想=1, 占卜解讀=2）",
    input_unit: "學習 / 研究靈性資料",
    xp_weight: 0.85,
  },
  hobby: {
    label: "Hobby",
    emoji: "🎮",
    description: "興趣娛樂：打電動、看電影/書、收藏、桌遊、園藝、烹飪",
    output_unit: "完成的活動段（1 小時電玩=1, 完成一本書=5）",
    input_unit: "查資料 / 攻略研究",
    xp_weight: 0.8,
  },
} as const satisfies Record<string, CategoryDef>;

export const ACHIEVEMENT_CATEGORIES = Object.keys(
  CATEGORY_DEFINITIONS,
) as (keyof typeof CATEGORY_DEFINITIONS)[];

export type AchievementCategory = keyof typeof CATEGORY_DEFINITIONS;
