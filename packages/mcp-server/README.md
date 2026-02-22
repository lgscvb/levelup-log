# @levelup-log/mcp-server

Turn your daily tasks into game-like achievements. An MCP (Model Context Protocol) server that lets any AI assistant record and track your accomplishments.

## Quick Start

```bash
npx @levelup-log/mcp-server init
```

This auto-detects your installed AI tools (Claude Desktop, Claude Code, Cursor, Windsurf) and configures them.

## Manual Setup

Add to your MCP config:

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

## Available Tools

| Tool | Description |
|------|-------------|
| `record_achievement` | Record a daily achievement with XP |
| `get_my_stats` | View your level, XP, streak, and title |
| `get_recent` | Get recent achievements with filtering |
| `check_unlocks` | Check for newly unlocked titles |
| `leaderboard` | View season/monthly/all-time rankings |

## Achievement Categories

code, fix, deploy, test, docs, refactor, review, learn, ops, milestone, life, health, finance, social, creative

## How It Works

1. Install the MCP server in your AI tool
2. Sign in with Google on first use
3. Your AI assistant automatically records achievements as you work
4. Visit your profile at levelup.log to see your progress

## License

MIT
