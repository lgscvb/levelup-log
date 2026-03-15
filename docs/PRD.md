# LevelUp.log PRD (Product Requirements Document)

> Last updated: 2026-03-08

---

## 1. 產品定位

**一句話定位：**
> LLM 世代的個人作業系統。跨平台、帶得走、越用越懂你。

**產品描述：**
裝一個 MCP，讓 AI 幫你記錄每天做了什麼，把瑣碎的日常變成看得見的成就。像在 LLM 上寫日記，但對話對象會即時回應、打雞血。你的年齡就是你的等級 — 問題不是你幾級，而是你在這個等級做了什麼。

**目標用戶：**
所有使用 LLM 工具的人 — 工程師、PM、設計師、學生、家庭主婦、自由工作者。

### 核心解決的心理問題

| 心理問題 | 產品機制 |
|--------|--------|
| 不熟悉、不確定 | 成就紀錄讓用戶看見自己走了多遠 |
| 不會做 | LLM 把「做了」翻譯成「做成了」|
| 沒有標準 | XP + 類別分布給出具體進度感 |
| 任務邊界不清 | TDD Skill 幫用戶在開始前定義完成標準 |
| 沒有兜底 | Layer 3 兜底報告，推薦對應專業資源 |
| 沉沒成本焦慮 | 年度回顧讓用戶看見「沉沒的是地基，不是損失」|
| LLM 加速焦慮 | 用同一個 LLM，把加速器變成記錄器 |

### 跨平台優勢

用戶的成就紀錄、任務標準、個人脈絡存在 MCP Server，不需要在每個工具重寫 CLAUDE.md、.cursorrules 或 Custom Instructions，脈絡跟著用戶，不跟著工具。

---

## 2. 技術選型

| 項目 | 選擇 |
|------|------|
| 產品名稱 | **LevelUp.log** |
| MCP Server | TypeScript + `@modelcontextprotocol/sdk` ^1.27+ |
| 後端 | Supabase（Auth + PostgreSQL + Edge Functions + Cron） |
| 前端 | Next.js 15（App Router）+ Vercel |
| 認證 | Google OAuth via Supabase Auth |
| Monorepo | pnpm 10 + Turborepo 2 |
| Build | tsup（MCP Server）/ Next.js built-in（前端） |
| 測試 | Vitest |
| npm 套件名 | `@levelup-log/mcp-server` |
| Schema 驗證 | Zod ^4.3.0 |

---

## 3. MCP Tools（5 個）

### Tool 1: `record_achievement` — 記錄成就
- LLM 自動或手動觸發
- 參數：category, title, description, xp, tags, context
- POST → Supabase Edge Function `/functions/v1/record-achievement`
- Edge Function：寫入 achievements、累加 XP、更新 streak、更新賽季 XP、檢查稱號解鎖
- 回傳：achievement + total_xp + age_level + new_titles

**成就類別（15 類）：**
```
'code'       — 寫程式、功能開發
'fix'        — 修 bug
'deploy'     — 部署上線
'test'       — 寫測試
'docs'       — 寫文件
'refactor'   — 重構
'review'     — Code review
'learn'      — 學習新知
'ops'        — DevOps / 維運
'milestone'  — 里程碑
'life'       — 日常生活（帶小孩、家務、加油）
'health'     — 健康（運動、飲食、看醫生）
'finance'    — 財務（記帳、省錢、投資）
'social'     — 社交（幫助他人、聚會）
'creative'   — 創作（寫文章、畫畫、做影片）
```

### Tool 2: `get_my_stats` — 查看統計
- GET `/functions/v1/get-stats`
- 回傳：age_level, total_xp, year_xp, streak, season rank, category breakdown, profile_url

### Tool 3: `get_recent` — 最近成就
- GET `/functions/v1/get-recent?limit=10&days=7`
- 支援 category 篩選

### Tool 4: `check_unlocks` — 檢查新稱號
- GET `/functions/v1/check-unlocks`
- 回傳 newly_unlocked + progress（距離下一個稱號的進度）

### Tool 5: `leaderboard` — 排行榜
- GET `/functions/v1/leaderboard?type=season&limit=10`
- 總是附帶自己的排名

---

## 4. Skill 三層 Prompt 設計

在 `registerPrompt` 中實作三層行為邏輯：

### Layer 1：日常模式

- 每次 `record_achievement` 後用遊戲化語言慶祝（「你擊敗了一隻 Bug！」）
- 生日時慶祝「升級」：「恭喜升到 Lv.29！去年你在 Lv.28 完成了 1,200 件事！」
- streak 即將中斷時提醒
- 用戶表達疲憊時給予具體認可（像教練，不是雞湯）
- 身份強化：「你正在成為那個每天都 ____ 的人」

### Layer 2：TDD 任務邊界模式

**觸發條件：** 用戶說「我要做 X」或「我在做 X」

**行為邏輯：**
```
用戶說「我要做 X」
    |
LLM 不問「你的標準是什麼」（用戶通常不知道）
    |
LLM 主動問以下三個問題拆解任務：
  1. 「這件事做完，誰會知道？」
  2. 「做完之後你會做什麼？」
  3. 「最小可以做到什麼程度還算有意義？」
    |
根據回答幫用戶生成具體的完成標準
    |
用戶確認或調整標準 -> 標準記錄，開始做
    |
用戶回來說完成了 -> LLM 對照當初的標準驗收
    |
通過 -> 記錄成就 + XP
```

**適用範圍（非 code 專屬）：**

| 領域 | 任務例子 | 完成標準例子 |
|------|--------|------------|
| 工作 | 寫提案 | 客戶看完有回覆 |
| 健康 | 開始運動 | 連續三天各30分鐘 |
| 學習 | 學 TypeScript | 能自己寫一個 API |
| 生活 | 整理房間 | 桌面淨空 |
| 創業 | 做 landing page | 上線有人填表單 |

### Layer 3：兜底報告模式

**觸發條件：**
- 連續負面情緒偵測（如「我好累」「我不想做了」「卡住了」）
- 特定類別連續 14 天空白
- 用戶主動說「幫我分析」

**行為邏輯：**
```
掃描用戶最近 30 天成就紀錄
    |
找出缺口（哪個類別空白、哪個任務反覆失敗）
    |
生成一份簡短分析報告：
  - 你這個月做了什麼（具體認可）
  - 你可能卡在哪裡（客觀分析）
  - 建議的下一步（最小行動）
    |
報告結尾：推薦對應的專業資源（referral_slots）
附上推薦碼（promo_code）
```

---

## 5. 資料庫 Schema

### 核心表（已部署至 Supabase）

```sql
-- profiles（auth.users trigger 自動建立）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  birth_date DATE,
  total_xp BIGINT DEFAULT 0,
  year_xp BIGINT DEFAULT 0,
  active_title_id UUID REFERENCES title_definitions(id),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  stripe_customer_id TEXT,
  month_xp_used INTEGER DEFAULT 0,
  achievements_this_month INTEGER DEFAULT 0,
  default_public BOOLEAN DEFAULT true,
  referral_provider BOOLEAN DEFAULT false,
  provider_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- yearly_snapshots（每年 1/1 自動記錄）
CREATE TABLE yearly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  year INTEGER NOT NULL,
  age_level INTEGER NOT NULL,
  year_xp BIGINT NOT NULL,
  achievements_count INTEGER NOT NULL,
  top_categories JSONB,
  longest_streak INTEGER,
  titles_unlocked INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  xp INTEGER NOT NULL CHECK (xp BETWEEN 5 AND 500),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  source_platform TEXT,
  is_public BOOLEAN DEFAULT true,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- title_definitions（稱號定義，靜態）
CREATE TABLE title_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value JSONB NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  icon TEXT,
  is_seasonal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_titles（已解鎖稱號）
CREATE TABLE user_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  title_id UUID NOT NULL REFERENCES title_definitions(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, title_id)
);

-- seasons / season_participants / follows / activity_feed
-- （詳見 supabase/migrations/20260222000000_initial_schema.sql）
```

### 推薦系統表（Layer 3 商業化，待部署）

```sql
-- referral_slots（推薦位置管理）
CREATE TABLE referral_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  provider_id UUID REFERENCES profiles(id),
  description TEXT,
  contact_url TEXT,
  promo_code TEXT,
  promo_description TEXT,
  rank INTEGER NOT NULL DEFAULT 1,
  is_paid BOOLEAN DEFAULT false,
  bid_amount NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX ON referral_slots(category, rank) WHERE is_active = true;

-- referral_clicks（點擊追蹤）
CREATE TABLE referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID REFERENCES referral_slots(id),
  user_id UUID REFERENCES profiles(id),
  trigger_type TEXT,    -- 'layer3_report' | 'manual' | 'weekly_analysis'
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 等級系統

- **等級 = 使用者年齡**（從 `birth_date` 計算）
- **XP** 為累積指標，用途：稱號解鎖、排行榜排名、年度回顧
- **year_xp** 每年 1/1 歸零（快照到 `yearly_snapshots`）

### 初始稱號（15 個 seed data，已部署）

- XP 累積：Newcomer(0), Apprentice(500), Journeyman(2000), Expert(10000), Master(50000), Grandmaster(200000)
- 類別專精：Bug Slayer(fix x 50), Test Knight(test x 100), Doc Wizard(docs x 30), Life Juggler(life x 100)
- Streak：Consistent(7天), Dedicated(30天), Unstoppable(100天)
- 年度：Year Champion（單年 XP > 10,000）、Comeback King（中斷 30 天後重新連續 7 天）

---

## 6. 認證流程（MCP Server）

```
Tool 呼叫 -> 檢查 keychain token -> 過期？-> refresh token
                                   | 無 token
                      啟動 localhost:19876 臨時 server
                      -> 開瀏覽器 Google OAuth
                      -> callback 取得 token
                      -> 存入 ~/.levelup/credentials.json
                      -> 關閉臨時 server
```

---

## 7. 前端路由

```
/                    — 首頁：全球動態牆 + 統計 + 「安裝 MCP」CTA
/leaderboard         — 排行榜（本週/本月/賽季/總計）
/u/[slug]            — 個人公開頁面（等級、XP、稱號、成就時間線）
/dashboard           — 私人儀表板（需登入）
/dashboard/settings  — 個人設定（暱稱、隱私、刪除帳號）
/admin/referrals     — 管理推薦位（簡單版，初期只有自己用）
/admin/clicks        — 查看點擊紀錄
/login               — Google OAuth 登入
/api/og/[slug]       — OG Image 動態生成（分享用）
```

---

## 8. 商業模式

### 三條收入線

| 收入來源 | 條件 | 定價方式 |
|--------|------|--------|
| Pro 訂閱 | 用戶付費 | $5/月 或 $30/年（暫不啟用） |
| 推薦排名月費 | 同產業複數廣告主競標 | 月費競標 |
| 推薦碼成交佣金 | 用戶使用推薦碼成交 | 手動結算（初期） |

### Free vs Pro（暫不啟用）

| | 免費 | Pro |
|---|---|---|
| 每月 XP 上限 | 2,000 XP（約 80 個成就） | 無限 |
| 個人頁面 URL | `/u/a8f3d2e1`（隨機 ID） | `/u/自訂暱稱` |
| 追蹤好友 | 無 | 追蹤 + 好友動態牆 |
| 排行榜 | 只能看 | 自己出現在排名上 |
| 統計 | 基本（當月） | 進階（趨勢圖、類別分析、年度回顧） |
| 匯出 | 無 | 年度回顧 PDF |

### Referral 推薦排名規則

- 同產業只有一家 -> 免費，rank = 1，獨佔
- 同產業出現第二家 -> 付費競標排名，bid_amount 高者得 rank 1
- 免費的永遠排在付費後面

### Referral 收費階段

| 階段 | 模式 | 方式 |
|------|------|------|
| MVP（0 ~ 有流量） | 免費，累積數據 | 觀察點擊率 |
| 驗證期（有點擊數據） | 向廣告主收月費競標排名 | 手動收款 |
| 規模期 | 點擊費 + 推薦碼成交回報佣金 | 系統追蹤 |

### 推薦碼追蹤流程（不需埋碼）

```
LLM 兜底報告出現推薦
    |
「輸入 LEVELUP-TAX01 可獲得首次諮詢折扣」
    |
用戶拿碼去聯繫廣告主
    |
廣告主回報給 LevelUp.log 運營方（初期手動）
    |
按月結算導流費
```

### 成本預估

| 階段 | 用戶數 | 月成本 |
|------|--------|--------|
| 早期 | 0-5,000 | $0（Supabase Free + Vercel Free） |
| 成長 | 5K-50K | ~$25/月（Supabase Pro） |
| 規模 | 50K+ | ~$100/月 |

核心成本優勢：LLM 運算由用戶自己的 session 承擔，成本只有 DB 儲存 + 頻寬。

---

## 9. 資料安全

### 去識別化策略
1. **LLM 層**：tool description 指示 LLM「用抽象化描述，不要包含具體公司名、客戶名、程式碼」
2. **Edge Function 層**：regex 過濾常見敏感模式（email、電話、IP、API key）
3. **用戶控制**：`is_public` 欄位，標記為 private 的不出現在動態牆
4. **設定頁**：用戶可選「預設公開」或「預設私密」

### Anon Key 安全說明
`SUPABASE_ANON_KEY` 是公開金鑰，可硬編碼。安全性由以下機制保證：
1. RLS 綁 JWT：INSERT policy 要求 `auth.uid() = user_id`
2. JWT 需要 Google OAuth
3. Edge Function 二次驗證 + rate limit（20/hr）
4. anon key 只能做 RLS 允許的事

### Rate Limiting（三層防線）
1. **本地**：同 category 冷卻 60 秒，單 session 上限 30 個成就
2. **Edge Function**：每用戶每小時上限 20 個
3. **資料庫**：RLS policy + auth.uid() 強制綁定

---

## 10. 環境變數

| 變數 | 必填 | 說明 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 是 | Supabase 專案 URL（前端用） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 是 | Supabase anon key（前端用） |
| `LEVELUP_SUPABASE_URL` | 可硬編碼 | Supabase 專案 URL（MCP Server 用） |
| `LEVELUP_SUPABASE_ANON_KEY` | 可硬編碼 | Supabase anon key（MCP Server 用） |
| `LEVELUP_AUTH_PORT` | 否 | OAuth callback port（預設 19876） |
| `LEVELUP_DEBUG` | 否 | 除錯日誌（stderr），預設 false |

---

## 11. 風險與對策

| 風險 | 對策 |
|------|------|
| 用了幾天就忘了 | streak 機制 + LLM prompt 主動提醒 + 每週 email 摘要 |
| 成就太假太諂媚 | 提供「務實模式」vs「浮誇模式」；用戶可調 tone |
| 資料隱私 | LLM 層抽象化 + Edge Function regex 過濾 + is_public 控制 |
| 灌水 | 三層防線：本地 60s cooldown + Edge Function 20/hr + DB trigger |
| DB 欄位太複雜 | 核心簡單 + metadata JSONB 彈性擴展 |
| MCP 安裝門檻 | init 自動偵測 + 一行 npx 安裝 |
| 推薦太生硬感覺像廣告 | Layer 3 只在用戶真的卡住時出現，不主動推銷 |
| 廣告主不知道怎麼計費 | 初期全免費，等有數據再談錢 |
| 推薦碼無法驗證成交 | 靠信任關係（廣告主是現有客戶），初期手動結算 |

---

## 12. Cron Jobs（pg_cron）

- 每日 00:00 UTC：更新 streak（斷了歸零）、重置 achievements_this_month（每月 1 號）
- 每年 1/1：快照 `yearly_snapshots`，重置 `year_xp` 為 0
- 每週一：計算排行榜快取
- 每季末：賽季結算、排名定格、發放賽季稱號
- 每日：檢查生日用戶，觸發「升級」事件到 activity_feed

---

## 13. 安裝方式

```bash
npx @levelup-log/mcp-server init
```

流程：
1. 偵測已安裝的 LLM 工具（Claude Desktop, Claude Code, Cursor...）
2. 顯示偵測結果，讓用戶選擇要設定哪些
3. 自動寫入對應的 config 檔
4. 引導 Google OAuth 登入
5. 顯示個人頁面 URL

---

## 14. 新增 Edge Function: `get-referral`

根據用戶最近空白類別，返回對應 `referral_slots`（rank 排序）。

**邏輯：**
1. 查詢用戶最近 30 天各 category 的成就數量
2. 找出空白或低活躍的 category
3. 根據 category 查 `referral_slots`（`is_active = true`，`rank ASC`）
4. 回傳推薦列表

---

## 15. 部署狀態

| 元件 | 狀態 | 位置 |
|------|------|------|
| Supabase DB | 已部署 | `hkuvfhfwbhkjmeqvwrxy.supabase.co` |
| Edge Functions (5) | 已部署 | record-achievement, get-stats, get-recent, check-unlocks, leaderboard |
| Google OAuth | 已設定 | Supabase Auth |
| Seed Data | 已載入 | 15 個稱號 |
| GitHub | 已推送 | `github.com/lgscvb/levelup-log` |
| Vercel | 待部署 | `packages/web` |
| npm | 待發布 | `@levelup-log/mcp-server` |
| referral 表 | 待部署 | Migration 尚未建立 |
| get-referral | 待開發 | Edge Function 尚未建立 |
