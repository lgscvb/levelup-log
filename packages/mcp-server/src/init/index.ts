import { detectTools } from './detect.js';
import { writeConfig } from './write-config.js';

const MCP_CONFIG = {
  command: 'npx',
  args: ['-y', '@levelup-log/mcp-server@latest', 'serve'],
};

export async function runInit() {
  console.log('');
  console.log('  LevelUp.log Setup Wizard');
  console.log('  ========================');
  console.log('');

  // Step 1: Detect installed LLM tools
  console.log('  Detecting installed LLM tools...');
  const tools = await detectTools();

  if (tools.length === 0) {
    console.log('');
    console.log('  No supported LLM tools detected.');
    console.log('  You can manually add LevelUp.log to your MCP config:');
    console.log('');
    console.log(JSON.stringify({ mcpServers: { 'levelup-log': MCP_CONFIG } }, null, 2));
    return;
  }

  console.log(`  Found ${tools.length} tool(s):`);
  tools.forEach(t => console.log(`    \u2713 ${t.name}`));
  console.log('');

  // Step 2: Write config to each detected tool
  let successCount = 0;
  for (const tool of tools) {
    const result = await writeConfig(tool, MCP_CONFIG);
    if (result.success) {
      console.log(`  \u2713 Configured ${tool.name}`);
      successCount++;
    } else {
      console.log(`  \u2717 ${tool.name}: ${result.error}`);
    }
  }

  console.log('');
  if (successCount > 0) {
    console.log(`  Done! LevelUp.log installed in ${successCount} tool(s).`);
    console.log('  Restart your LLM tool to activate.');
    console.log('');
    console.log('  On first use, you\'ll be prompted to sign in with Google.');
  } else {
    console.log('  No tools were configured. Please add manually.');
  }
  console.log('');
}
