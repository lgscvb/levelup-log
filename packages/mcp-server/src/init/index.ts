import { detectTools, detectRulesTargets } from "./detect.js";
import { writeConfig } from "./write-config.js";
import { writeAllRulesFiles } from "./write-rules.js";
import { installSkill } from "./write-skill.js";
import { existsSync } from "fs";
import { join } from "path";
import { homedir, platform } from "os";

const MCP_CONFIG = {
  command: "npx",
  args: ["-y", "@levelup-log/mcp-server@latest", "serve"],
};

/** ChatGPT Desktop supports MCP on macOS (v1.2024.x+). Detect its config path. */
function detectChatGptDesktop(): string | null {
  const home = homedir();
  const os = platform();

  const candidates =
    os === "darwin"
      ? [
          join(home, "Library", "Application Support", "ChatGPT", "mcp.json"),
          join(
            home,
            "Library",
            "Application Support",
            "com.openai.ChatGPT",
            "mcp.json",
          ),
        ]
      : os === "win32"
        ? [join(home, "AppData", "Roaming", "ChatGPT", "mcp.json")]
        : [];

  return candidates.find(existsSync) ?? null;
}

export async function runInit() {
  console.log("");
  console.log("  ╔══════════════════════════════════════╗");
  console.log("  ║   LevelUp.log Setup Wizard           ║");
  console.log("  ╚══════════════════════════════════════╝");
  console.log("");
  console.log("  Detecting installed LLM tools...");

  // ── Step 1: MCP config (all platforms) ──────────────────────────────────
  const tools = await detectTools();
  let mcpCount = 0;

  // Check ChatGPT Desktop separately (different config format handling)
  const chatGptPath = detectChatGptDesktop();
  if (chatGptPath) {
    tools.push({
      name: "ChatGPT Desktop",
      configPath: chatGptPath,
      type: "json-mcpServers",
    });
  }

  if (tools.length === 0) {
    console.log("");
    console.log("  No supported LLM tools detected. Manual config:");
    console.log("");
    console.log(
      JSON.stringify({ mcpServers: { "levelup-log": MCP_CONFIG } }, null, 2),
    );
    console.log("");
    printManualInstructions();
    return;
  }

  console.log(`  Found ${tools.length} tool(s):`);
  tools.forEach((t) => console.log(`    ✓ ${t.name}`));
  console.log("");

  for (const tool of tools) {
    const result = await writeConfig(tool, MCP_CONFIG);
    if (result.success) {
      console.log(`  ✓ MCP configured: ${tool.name}`);
      mcpCount++;
    } else {
      console.log(`  ✗ ${tool.name}: ${result.error}`);
    }
  }

  // ── Step 2: Global rules files (auto-trigger instructions) ──────────────
  console.log("");
  console.log("  Writing global rules (auto-trigger instructions)...");
  console.log(
    "  These make the AI proactively record achievements in every session.",
  );
  console.log("");

  const rulesTargets = await detectRulesTargets();
  if (rulesTargets.length > 0) {
    const results = writeAllRulesFiles(rulesTargets);
    for (const r of results) {
      if (!r.success) {
        console.log(`  ✗ ${r.name} rules: ${r.error}`);
      } else if (r.action === "already-present") {
        console.log(`  ✓ ${r.name}: rules already installed`);
      } else {
        console.log(
          `  ✓ ${r.name}: rules ${r.action} → ${rulesTargets.find((t) => t.name === r.name)?.globalRulesPath}`,
        );
      }
    }
  } else {
    console.log("  (no supported rules targets detected)");
  }

  // ── Step 3: ChatGPT Desktop manual note ─────────────────────────────────
  if (chatGptPath) {
    console.log("");
    console.log("  ℹ  ChatGPT Desktop detected.");
    console.log("     MCP config written. For auto-trigger, also paste into");
    console.log("     Settings → Personalization → Custom Instructions:");
    console.log("");
    console.log(
      '     "When I complete any meaningful task, use the record_achievement',
    );
    console.log(
      "      MCP tool to log it as an achievement. Don't wait to be asked.\"",
    );
  }

  // ── Step 4: Agent Skill (/levelup, cross-platform open standard) ────────
  console.log("");
  console.log("  Installing /levelup Agent Skill...");
  const skillResult = installSkill();
  if (skillResult.success) {
    const label =
      skillResult.action === "already-installed"
        ? "already installed"
        : skillResult.action;
    console.log(`  ✓ Skill ${label}: ${skillResult.path}`);
    console.log(
      "    Use /levelup in Claude Code, Cursor, Gemini CLI, Codex, Antigravity",
    );
    console.log("    to show stats + activate coach mode.");
  } else {
    console.log(`  ✗ Skill install failed: ${skillResult.error}`);
  }

  // ── Step 5: MCP server instructions note ─────────────────────────────────
  console.log("");
  console.log("  ✓ MCP server instructions active (Claude Desktop, Cursor,");
  console.log("    Windsurf, Antigravity auto-inject on every session).");

  // ── Done ─────────────────────────────────────────────────────────────────
  console.log("");
  if (mcpCount > 0) {
    console.log(
      `  Done! Installed in ${mcpCount} tool(s). Restart to activate.`,
    );
    console.log("  On first use, you'll be prompted to sign in with Google.");
  } else {
    console.log("  Rules written. Please add MCP config manually (see above).");
  }
  console.log("");
}

function printManualInstructions() {
  console.log("  ─── Manual Setup ───────────────────────────────────────────");
  console.log("  Add to your MCP tool's config (mcpServers section):");
  console.log("");
  console.log('  "levelup-log": {');
  console.log('    "command": "npx",');
  console.log('    "args": ["-y", "@levelup-log/mcp-server@latest", "serve"]');
  console.log("  }");
  console.log("");
  console.log("  For ChatGPT Desktop Custom Instructions, paste:");
  console.log('  "When I complete any meaningful task, use record_achievement');
  console.log("   to log it. Don't wait to be asked.\"");
  console.log("  ────────────────────────────────────────────────────────────");
}
