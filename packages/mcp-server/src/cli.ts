import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { logError } from "./utils/logger.js";

const command = process.argv[2];

async function serve() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("LevelUp.log MCP server running on stdio");
}

async function init() {
  const { runInit } = await import("./init/index.js");
  await runInit();
}

async function main() {
  switch (command) {
    case "serve":
    case undefined:
      await serve();
      break;
    case "init":
      await init();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.error("Usage: levelup-log [serve|init]");
      process.exit(1);
  }
}

main().catch((error) => {
  logError("Fatal error:", error);
  process.exit(1);
});
