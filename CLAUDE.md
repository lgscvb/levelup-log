# LevelUp.log

## Overview

LevelUp.log is a gamified achievement system delivered as an MCP (Model Context Protocol) server. Users install the MCP on any LLM tool (Claude Desktop, Claude Code, ChatGPT Desktop, Cursor, etc.) and their daily activities are automatically recorded as game-like achievements with XP, titles, streaks, and leaderboards.

**Core concept**: Your age is your level. The question isn't what level you are — it's what you accomplished at that level.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| MCP Server | TypeScript + `@modelcontextprotocol/sdk` ^1.12+ |
| Backend | Supabase (Auth + PostgreSQL + Edge Functions + pg_cron) |
| Frontend | Next.js 15 (App Router) + Vercel |
| Auth | Google OAuth via Supabase Auth |
| Monorepo | pnpm + Turborepo |
| Build (MCP) | tsup |
| Build (Web) | Next.js built-in |
| Test | Vitest |
| npm package | `@levelup-log/mcp-server` |

## Directory Structure

```
levelup-log/
├── packages/
│   ├── mcp-server/              # @levelup-log/mcp-server (npm package)
│   │   ├── src/
│   │   │   ├── cli.ts           # Entry point: serve | init
│   │   │   ├── server.ts        # McpServer + registerTool + registerPrompt
│   │   │   ├── tools/           # One file per MCP tool
│   │   │   │   ├── record-achievement.ts
│   │   │   │   ├── get-my-stats.ts
│   │   │   │   ├── get-recent.ts
│   │   │   │   ├── check-unlocks.ts
│   │   │   │   └── leaderboard.ts
│   │   │   ├── auth/            # OAuth + token management
│   │   │   │   ├── manager.ts
│   │   │   │   ├── keychain.ts
│   │   │   │   ├── oauth-server.ts
│   │   │   │   └── pkce.ts
│   │   │   └── utils/
│   │   │       ├── config.ts
│   │   │       ├── logger.ts
│   │   │       ├── rate-limiter.ts
│   │   │       └── supabase.ts
│   │   └── tests/
│   └── web/                     # Next.js 15 frontend
│       ├── src/app/
│       ├── src/components/
│       └── src/lib/
├── supabase/
│   ├── migrations/
│   ├── functions/               # Edge Functions
│   └── seed.sql
├── CLAUDE.md                    # This file
├── pnpm-workspace.yaml
└── turbo.json
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Dev (all packages)
pnpm dev

# Build (all packages)
pnpm build

# Test (all packages)
pnpm test

# MCP Server only
cd packages/mcp-server
pnpm dev          # tsx watch
pnpm build        # tsup
pnpm test         # vitest
pnpm inspect      # MCP Inspector

# Web only
cd packages/web
pnpm dev          # next dev
pnpm build        # next build

# Supabase
supabase start              # Local dev
supabase db push            # Apply migrations
supabase functions serve    # Local Edge Functions
```

## MCP Tools

| Tool | Description | HTTP Method | Edge Function |
|------|-------------|-------------|---------------|
| `record_achievement` | Record a new achievement | POST | `/functions/v1/record-achievement` |
| `get_my_stats` | Get user stats (XP, streak, titles) | GET | `/functions/v1/get-stats` |
| `get_recent` | Get recent achievements | GET | `/functions/v1/get-recent` |
| `check_unlocks` | Check newly unlocked titles | GET | `/functions/v1/check-unlocks` |
| `leaderboard` | View leaderboard | GET | `/functions/v1/leaderboard` |

## Achievement Categories

```
code, fix, deploy, test, docs, refactor, review, learn, ops, milestone,
life, health, finance, social, creative
```

## DB Schema (Core Tables)

- `profiles` — User profile (birth_date for age=level, XP, streak, tier)
- `achievements` — Individual achievements (category, title, description, xp, metadata JSONB)
- `title_definitions` — Static title definitions (requirements, rarity)
- `user_titles` — Unlocked titles per user
- `yearly_snapshots` — Annual XP/achievement snapshots
- `seasons` / `season_participants` — Seasonal competition
- `follows` — Social follow system
- `activity_feed` — Denormalized public feed

## Level System

- **Level = User's age** (calculated from `birth_date`)
- **XP** is cumulative, used for: title unlocks, leaderboard ranking, annual review
- **year_xp** resets every Jan 1 (snapshotted to `yearly_snapshots`)

## Auth Flow (MCP Server)

```
Tool call → Check keychain token → Expired? → Refresh
                                   ↓ No token
                      Start localhost:19876 temp server
                      → Open browser for Google OAuth
                      → Callback receives token
                      → Store in OS keychain (file fallback)
                      → Close temp server
```

## Rate Limiting (3 Layers)

1. **Local**: Same category cooldown 60s, session limit 30 achievements
2. **Edge Function**: 20 achievements/hour per user
3. **DB**: RLS policies + auth.uid() enforcement

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LEVELUP_SUPABASE_URL` | Hardcoded | Supabase project URL |
| `LEVELUP_SUPABASE_ANON_KEY` | Hardcoded | Supabase anon key (public) |
| `LEVELUP_AUTH_PORT` | No | OAuth callback port (default: 19876) |
| `LEVELUP_DEBUG` | No | Debug logging to stderr (default: false) |

## Coding Conventions

- **Language**: TypeScript strict mode
- **Module**: ESM (`"type": "module"`)
- **Naming**: camelCase for variables/functions, PascalCase for types/classes, kebab-case for files
- **Imports**: Use `.js` extension for local imports (ESM requirement)
- **Error handling**: Return structured errors, never throw in tool handlers
- **Logging**: Use `console.error()` for MCP (stderr), never `console.log()` (stdout is MCP protocol)
- **Tests**: Vitest, co-locate with `tests/` directory, name `*.test.ts`

## Business Model (MVP)

All features free during MVP. Pro tier architecture preserved but disabled:
- `profiles.tier` field exists (`'free' | 'pro'`)
- `profiles.stripe_customer_id` field exists
- `profiles.month_xp_used` field exists
- `ENABLE_PRO_LIMITS=false` in Edge Functions
