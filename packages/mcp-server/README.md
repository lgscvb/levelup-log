# @levelup-log/mcp-server

把你的日常變成遊戲成就。一個 MCP（Model Context Protocol）Server，讓任何 AI 助手幫你記錄和追蹤每天做的事。

## 快速安裝

```bash
npx @levelup-log/mcp-server init
```

自動偵測你的 AI 工具（Claude Desktop、Claude Code、Cursor、Windsurf），一鍵完成 MCP 設定。

## 手動設定

在你的 MCP 設定檔中加入：

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

各平台設定檔位置：
- **Claude Desktop**：`~/Library/Application Support/Claude/claude_desktop_config.json`（macOS）
- **Claude Code**：`~/.claude/settings.json`
- **Cursor**：`~/.cursor/mcp.json`
- **Windsurf**：`~/.windsurf/mcp.json`

## 可用工具

| 工具 | 說明 |
|------|------|
| `record_achievement` | 記錄成就（類別、標題、描述、XP 5-500） |
| `get_my_stats` | 查看等級、累積 XP、年度 XP、streak、稱號 |
| `get_recent` | 最近成就（支援類別 / 天數 / 數量篩選） |
| `check_unlocks` | 檢查新解鎖稱號 + 下一個稱號的進度 |
| `leaderboard` | 排行榜（賽季 / 月度 / 歷史），附帶自己的排名 |

## 成就類別

| 類別 | 說明 |
|------|------|
| `code` | 寫程式、功能開發 |
| `fix` | 修 Bug |
| `deploy` | 部署上線 |
| `test` | 寫測試 |
| `docs` | 寫文件 |
| `refactor` | 重構 |
| `review` | Code Review |
| `learn` | 學習新知 |
| `ops` | DevOps / 維運 |
| `milestone` | 里程碑 |
| `life` | 日常生活（帶小孩、家務、跑腿） |
| `health` | 健康（運動、飲食、看醫生） |
| `finance` | 財務（記帳、省錢、投資） |
| `social` | 社交（幫助他人、聚會） |
| `creative` | 創作（寫文章、畫畫、做影片） |

## 運作方式

1. 安裝 MCP Server 到你的 AI 工具
2. 首次使用時會引導 Google OAuth 登入
3. AI 助手在你工作或生活時自動記錄成就
4. 造訪你的個人頁面查看進度

## 技術細節

- TypeScript + ESM
- `@modelcontextprotocol/sdk` ^1.27.0 + Zod ^4.3.0
- 認證：Google OAuth + PKCE + 本地 keychain（`~/.levelup/credentials.json`）
- 三層速率限制：本地 60s 冷卻 + Edge Function 20/hr + DB RLS
- tsup 建置，支援 code splitting（init 模組動態載入）
- 41 個 Vitest 測試

## 開發

```bash
pnpm dev          # tsx watch
pnpm build        # tsup
pnpm test         # vitest
pnpm inspect      # MCP Inspector
```

## 授權

MIT
