# LevelUp.log

> Turn your daily grind into a game. An MCP Server for AI assistants that silently records your micro-achievements between conversations.

**"I did so much today but it feels like I did nothing."** — Sound familiar? LevelUp.log fixes that.

[English](./README.md) | [繁體中文](./README.zh-TW.md)

## Quick Start

```bash
npx @levelup-log/mcp-server init
```

Auto-detects your AI tools (Claude Desktop, Claude Code, Cursor, Windsurf) and configures MCP in one command.

## What is this?

LevelUp.log is an [MCP](https://modelcontextprotocol.io/) (Model Context Protocol) Server. Once installed, your AI assistant automatically turns everyday activities into game-style achievements:

- **Wrote code**? +50 XP — "Bug Slayer"
- **Took care of the kids**? +30 XP — "Parenting Hero"
- **Went for a run**? +25 XP — "Morning Warrior"
- **Learned something new**? +40 XP — "Knowledge Seeker"

Your age is your level (28 years old = Lv.28). XP unlocks titles, climbs leaderboards, and powers your yearly review.

## Why MCP?

Traditional habit trackers fail because **recording itself is a chore**. With MCP, logging happens as a byproduct of conversation. Just talk to your AI assistant as you normally do — achievements drop automatically, like loot in an RPG.

Zero friction. Pure dopamine.

## Features

| Feature | Description |
|---------|-------------|
| Achievements | 15 categories (code, life, health, learn, creative...) |
| XP System | 5-500 XP per achievement, cumulative + yearly + seasonal |
| Level System | Age = Level. Auto "level up" on your birthday |
| Titles | 15 titles (common → legendary), auto-unlock when conditions are met |
| Streaks | Daily streak tracking. Your AI coach won't let you break it |
| Leaderboard | Season / monthly / all-time rankings |
| Public Profile | `/u/yourname` — share your achievement page |
| AI Coach | Not empty praise — specific recognition with personality |

## How It Works

```
You talk to AI → AI detects an achievement → MCP records it → XP + title check
                                                            → Streak update
                                                            → Leaderboard sync
```

1. Install the MCP Server in your AI tool
2. First use triggers Google OAuth login
3. Your AI assistant records achievements as you work and live
4. Visit your profile page to see your progress

## Achievement Categories

| Category | What counts |
|----------|-------------|
| `code` | Writing code, shipping features |
| `fix` | Bug fixes |
| `deploy` | Deployments, releases |
| `test` | Writing tests |
| `docs` | Documentation |
| `refactor` | Code refactoring |
| `review` | Code reviews |
| `learn` | Learning something new |
| `ops` | DevOps, infrastructure |
| `milestone` | Major milestones |
| `life` | Daily life (parenting, errands, chores) |
| `health` | Exercise, diet, medical |
| `finance` | Budgeting, saving, investing |
| `social` | Helping others, meetups |
| `creative` | Writing, drawing, making videos |

## Tech Stack

```
Monorepo (pnpm + Turborepo)
├── MCP Server — TypeScript + @modelcontextprotocol/sdk ^1.27.0 + Zod 4
├── Frontend   — Next.js 15 (App Router) + Tailwind CSS v4 + @supabase/ssr
├── Backend    — Supabase (PostgreSQL + Edge Functions + Auth)
└── CI/CD      — GitHub Actions + Vercel
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `record_achievement` | Record an achievement (category, title, description, XP 5-500) |
| `get_my_stats` | View level, total XP, yearly XP, streak, active title |
| `get_recent` | Recent achievements (filter by category / days / count) |
| `check_unlocks` | Check newly unlocked titles + progress to next title |
| `leaderboard` | Rankings (season / monthly / all-time) with your position |

## Manual Setup

Add to your MCP config file:

```json
{
  "mcpServers": {
    "levelup-log": {
      "command": "npx",
      "args": ["-y", "@levelup-log/mcp-server@latest", "serve"]
    }
  }
}
```

Config file locations:
- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
- **Claude Code**: `~/.claude/settings.json`
- **Cursor**: `~/.cursor/mcp.json`
- **Windsurf**: `~/.windsurf/mcp.json`

## Project Structure

```
levelup-log/
├── packages/
│   ├── mcp-server/        # npm: @levelup-log/mcp-server
│   │   ├── src/server.ts  # 5 MCP tools + 1 prompt
│   │   ├── src/auth/      # OAuth + PKCE + keychain
│   │   ├── src/init/      # npx init setup wizard
│   │   ├── src/utils/     # API, config, rate-limiter, logger
│   │   └── tests/         # 41 Vitest tests
│   └── web/               # Next.js 15 frontend
│       └── src/app/       # 9 routes (home, login, dashboard, leaderboard, profile...)
├── supabase/
│   ├── migrations/        # 9 tables + RLS + Triggers
│   ├── functions/         # 5 Edge Functions
│   └── seed.sql           # 15 seed titles
└── .github/workflows/     # CI + npm publish
```

## Development

### Prerequisites

- Node.js >= 20
- pnpm 10+
- Supabase CLI (for local development)

### Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start all packages in dev mode
pnpm build            # Build all packages
pnpm test             # Run all tests
```

### Per-package

```bash
# MCP Server
cd packages/mcp-server
pnpm dev              # tsx watch mode
pnpm test             # vitest (41 tests)
pnpm inspect          # MCP Inspector

# Frontend
cd packages/web
pnpm dev              # next dev --turbopack
pnpm build            # next build
```

### Environment Variables

```env
# Frontend (packages/web)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# MCP Server: anon key is hardcoded in config.ts (public key, safe to embed)
```

## Deployment

| Component | Platform |
|-----------|----------|
| Frontend | Vercel (auto-build from `packages/web`) |
| Backend | Supabase (hosted) |
| MCP Server | npm (`@levelup-log/mcp-server`) |
| CI | GitHub Actions |

### npm Publishing

```bash
git tag mcp-server@0.1.0
git push --tags
# GitHub Actions auto-publishes to npm
```

## Security

- **3-layer rate limiting**: Local 60s cooldown → Edge Function 20/hr → Database RLS
- **Auth**: Google OAuth + PKCE flow, tokens stored locally at `~/.levelup/credentials.json`
- **RLS**: All database operations bound to `auth.uid()` — users can only access their own data
- **Sanitization**: Edge Functions filter sensitive patterns (emails, IPs, API keys) before storage

## License

MIT
