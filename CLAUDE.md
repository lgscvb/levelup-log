# LevelUp.log

## 專案概述

LevelUp.log 是一套遊戲化成就系統，透過 MCP（Model Context Protocol）Server 交付。使用者在任何 LLM 工具（Claude Desktop、Claude Code、ChatGPT Desktop、Cursor 等）安裝此 MCP，日常活動就會自動被記錄為遊戲式成就，附帶 XP、稱號、連續天數和排行榜。

**核心概念**：你的年齡就是你的等級。問題不是你幾級 — 而是你在這個等級做了什麼。

## 技術棧

| 元件 | 技術 |
|------|------|
| MCP Server | TypeScript + `@modelcontextprotocol/sdk` ^1.27.0 |
| 後端 | Supabase（Auth + PostgreSQL + Edge Functions + pg_cron） |
| 前端 | Next.js 15（App Router）+ Vercel |
| 認證 | Google OAuth via Supabase Auth |
| Monorepo | pnpm 10 + Turborepo 2 |
| 建置（MCP） | tsup |
| 建置（前端） | Next.js 內建 |
| 測試 | Vitest |
| npm 套件 | `@levelup-log/mcp-server` |
| Schema 驗證 | Zod ^4.3.0 |

## 目錄結構

```
levelup-log/
├── packages/
│   ├── mcp-server/              # @levelup-log/mcp-server（npm 套件）
│   │   ├── src/
│   │   │   ├── cli.ts           # 入口：serve | init
│   │   │   ├── server.ts        # McpServer + registerTool + registerPrompt
│   │   │   ├── auth/            # OAuth + token 管理
│   │   │   │   ├── manager.ts   # getValidToken, refreshToken, login
│   │   │   │   ├── keychain.ts  # ~/.levelup/credentials.json 存取
│   │   │   │   ├── oauth-server.ts  # localhost:19876 臨時 callback server
│   │   │   │   └── pkce.ts      # PKCE code_verifier / code_challenge
│   │   │   ├── init/            # npx init 安裝精靈
│   │   │   │   ├── index.ts     # 主流程
│   │   │   │   ├── detect.ts    # 偵測已安裝的 LLM 工具
│   │   │   │   └── write-config.ts  # 安全寫入 MCP 設定
│   │   │   └── utils/
│   │   │       ├── api.ts       # apiGet / apiPost（呼叫 Edge Function）
│   │   │       ├── config.ts    # CONFIG 常數 + 15 個成就類別
│   │   │       ├── logger.ts    # stderr 日誌（MCP 專用）
│   │   │       ├── rate-limiter.ts  # 本地速率限制
│   │   │       └── supabase.ts  # Supabase client 工廠
│   │   └── tests/               # 41 個測試
│   └── web/                     # Next.js 15 前端
│       ├── src/app/
│       │   ├── page.tsx         # 首頁
│       │   ├── login/           # Google OAuth 登入
│       │   ├── dashboard/       # 私人儀表板（需登入）
│       │   │   ├── page.tsx
│       │   │   ├── settings/    # 個人設定
│       │   │   └── loading.tsx
│       │   ├── leaderboard/     # 排行榜
│       │   ├── u/[slug]/        # 公開個人頁面
│       │   ├── api/og/[slug]/   # OG Image 動態生成
│       │   ├── auth/callback/   # OAuth callback
│       │   ├── not-found.tsx
│       │   └── error.tsx
│       ├── src/components/
│       │   └── nav.tsx          # 共用導覽列
│       └── src/lib/
│           ├── supabase-server.ts   # Server Component 用
│           ├── supabase-browser.ts  # Client Component 用
│           └── supabase.ts          # 向下相容 re-export
├── supabase/
│   ├── migrations/
│   │   └── 20260222000000_initial_schema.sql  # 9 張表 + RLS + Trigger
│   ├── functions/               # 5 個 Edge Function
│   │   ├── _shared/             # cors.ts, auth.ts, rate-limit.ts, sanitize.ts
│   │   ├── record-achievement/
│   │   ├── get-stats/
│   │   ├── get-recent/
│   │   ├── check-unlocks/
│   │   └── leaderboard/
│   └── seed.sql                 # 15 個初始稱號
├── .github/workflows/
│   ├── ci.yml                   # 測試 + 建置（push/PR 觸發）
│   └── publish.yml              # npm publish（tag 觸發）
├── CLAUDE.md                    # 本檔案
├── pnpm-workspace.yaml
└── turbo.json
```

## 開發指令

```bash
# 安裝依賴
pnpm install

# 全套件開發
pnpm dev

# 全套件建置
pnpm build

# 全套件測試
pnpm test

# MCP Server 單獨
cd packages/mcp-server
pnpm dev          # tsx watch
pnpm build        # tsup
pnpm test         # vitest（41 個測試）
pnpm inspect      # MCP Inspector

# 前端單獨
cd packages/web
pnpm dev          # next dev --turbopack
pnpm build        # next build

# Supabase
supabase start              # 本地開發
supabase db push            # 套用 migration
supabase functions serve    # 本地 Edge Function
```

## MCP Tools

| 工具 | 說明 | HTTP 方法 | Edge Function |
|------|------|-----------|---------------|
| `record_achievement` | 記錄成就 | POST | `/functions/v1/record-achievement` |
| `get_my_stats` | 查看統計（XP、streak、稱號） | GET | `/functions/v1/get-stats` |
| `get_recent` | 查看最近成就 | GET | `/functions/v1/get-recent` |
| `check_unlocks` | 檢查新解鎖稱號 | GET | `/functions/v1/check-unlocks` |
| `leaderboard` | 排行榜 | GET | `/functions/v1/leaderboard` |

## 成就類別（15 類）

```
code, fix, deploy, test, docs, refactor, review, learn, ops, milestone,
life, health, finance, social, creative
```

## 資料庫 Schema（核心表）

- `profiles` — 使用者檔案（birth_date 用於 年齡=等級、XP、streak、tier）
- `achievements` — 個別成就（category, title, description, xp, metadata JSONB）
- `title_definitions` — 靜態稱號定義（條件、稀有度）
- `user_titles` — 使用者已解鎖的稱號
- `yearly_snapshots` — 年度 XP / 成就快照
- `seasons` / `season_participants` — 賽季競賽
- `follows` — 社交追蹤系統
- `activity_feed` — 反正規化公開動態牆

## 等級系統

- **等級 = 使用者年齡**（從 `birth_date` 計算）
- **XP** 為累積指標，用途：稱號解鎖、排行榜排名、年度回顧
- **year_xp** 每年 1/1 歸零（快照到 `yearly_snapshots`）

## 認證流程（MCP Server）

```
Tool 呼叫 → 檢查 keychain token → 過期？→ refresh token
                                   ↓ 無 token
                      啟動 localhost:19876 臨時 server
                      → 開瀏覽器進行 Google OAuth
                      → callback 取得 token
                      → 存入 ~/.levelup/credentials.json
                      → 關閉臨時 server
```

## 速率限制（三層防線）

1. **本地**：同類別冷卻 60 秒，單 session 上限 30 個成就
2. **Edge Function**：每用戶每小時上限 20 個
3. **資料庫**：RLS policy + auth.uid() 強制綁定

## 環境變數

| 變數 | 必填 | 說明 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 是 | Supabase 專案 URL（前端用） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 是 | Supabase anon key（前端用，公開金鑰） |
| `LEVELUP_SUPABASE_URL` | 可硬編碼 | Supabase 專案 URL（MCP Server 用） |
| `LEVELUP_SUPABASE_ANON_KEY` | 可硬編碼 | Supabase anon key（MCP Server 用） |
| `LEVELUP_AUTH_PORT` | 否 | OAuth callback port（預設 19876） |
| `LEVELUP_DEBUG` | 否 | 除錯日誌輸出至 stderr（預設 false） |

## 程式碼慣例

- **語言**：TypeScript strict mode
- **模組**：ESM（`"type": "module"`）
- **命名**：camelCase（變數/函式）、PascalCase（型別/類別）、kebab-case（檔名）
- **引入**：本地 import 必須加 `.js` 副檔名（ESM 要求）
- **錯誤處理**：回傳結構化錯誤，tool handler 中不要 throw
- **日誌**：MCP 環境使用 `console.error()`（stderr），絕不用 `console.log()`（stdout 是 MCP 協議通道）
- **測試**：Vitest，放在 `tests/` 目錄，命名 `*.test.ts`
- **Supabase Client**：
  - Server Component / Route Handler → `createSupabaseServer()`
  - Client Component → `createSupabaseBrowser()`
  - `@supabase/ssr` 使用 `getAll` / `setAll`（不用已棄用的 `get` / `set` / `remove`）
- **Next.js 15**：`params`、`searchParams`、`cookies()` 都是 async（需要 await）
- **Tailwind CSS v4**：不需要 config 檔，直接 `@import "tailwindcss"` 即可

## i18n 規範（前端必讀）

**支援語言（7 種）**：en, zh-TW, zh-CN, ja, ko, es, pt-BR

**翻譯檔位置**：`packages/web/src/lib/i18n.ts`

**Locale 狀態**：透過 `LocaleProvider`（React Context）管理，儲存於 localStorage。

### 新增或修改前端頁面時的 i18n 規則

**禁止**在 JSX 中硬編碼 UI 文字，一律使用 `t(locale).*`。

**Server Component 頁面（async function）**：
- 不能直接使用 `useLocale()`（hooks 只能在 client component 用）
- **做法**：建立對應的 `*Client.tsx`（加 `'use client'`），server component 抓資料後以 props 傳入 client component
- 範例：`dashboard/page.tsx` → `dashboard/DashboardClient.tsx`

**Client Component 頁面（已有 `'use client'`）**：
- 直接在頂層加 `const { locale } = useLocale(); const tr = t(locale).xxx;`

### 新增頁面時的 checklist

1. 把頁面所有 UI 字串加入 `i18n.ts` 的 `Translations` 型別
2. 為全部 7 個 locale 補齊翻譯（en 為基礎，其他語言確認語意正確）
3. Server Component → 建 `*Client.tsx` wrapper；Client Component → 直接用 `useLocale()`
4. 日期格式化用 `toLocaleDateString(locale, ...)` 而非硬編碼 `"en-US"`
5. 數字格式化用 `toLocaleString(locale)` 而非 `toLocaleString()`

## 商業模式（MVP）

MVP 期間全功能免費。Pro 付費架構已預留但暫不啟用：
- `profiles.tier` 欄位存在（`'free' | 'pro'`）
- `profiles.stripe_customer_id` 欄位存在
- `profiles.month_xp_used` 欄位存在
- Edge Function 中 `ENABLE_PRO_LIMITS=false`
