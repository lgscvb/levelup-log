# @levelup-log/web

LevelUp.log 前端應用 — Next.js 15 App Router + Supabase Auth + Tailwind CSS v4。

## 技術棧

| 項目 | 版本 |
|------|------|
| Next.js | 15（App Router + Turbopack） |
| React | 19 |
| Tailwind CSS | v4（不需 config 檔） |
| Supabase | @supabase/ssr ^0.6（getAll/setAll） |
| TypeScript | ^5.7 strict mode |

## 路由結構

```
/                    — 首頁（產品介紹 + 安裝指引）
/login               — Google OAuth 登入
/dashboard           — 私人儀表板（需登入）
/dashboard/settings  — 個人設定（暱稱、隱私、登出）
/leaderboard         — 排行榜（賽季/月度/歷史）
/u/[slug]            — 公開個人頁面（ISR 60s）
/api/og/[slug]       — OG Image 動態生成（Edge Runtime）
/auth/callback       — OAuth callback（code exchange）
```

## Supabase Client 使用規則

| 場景 | 使用方式 |
|------|----------|
| Server Component / Route Handler | `import { createSupabaseServer } from '@/lib/supabase-server'` |
| Client Component | `import { createSupabaseBrowser } from '@/lib/supabase-browser'` |
| 公開頁面（不需 auth） | 直接建立匿名 Supabase client |

重要：`@supabase/ssr` 0.6+ 使用 `getAll` / `setAll`，不要用已棄用的 `get` / `set` / `remove`。

## Next.js 15 注意事項

- `params`、`searchParams`、`cookies()` 都回傳 Promise，必須 `await`
- Middleware 用 `getUser()` 驗證（不用 `getSession()`）
- ISR：個人頁面 60 秒、排行榜 300 秒

## 頁面元件類型

| 頁面 | 類型 | 原因 |
|------|------|------|
| `/` | Server Component | 靜態內容 |
| `/login` | Client Component | 需要瀏覽器 OAuth |
| `/dashboard` | Server Component | 伺服器端取資料 + auth guard |
| `/dashboard/settings` | Client Component | 表單互動 + 即時更新 |
| `/leaderboard` | Server Component + ISR | 快取 + 查詢參數切換 |
| `/u/[slug]` | Server Component + ISR | 公開頁面 + OG metadata |

## 開發

```bash
pnpm dev        # next dev --turbopack
pnpm build      # next build
pnpm start      # next start（production）
pnpm lint       # next lint
```

## 環境變數

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
