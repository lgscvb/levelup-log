import { defineConfig } from "tsup";
import { createRequire } from "module";
const _require = createRequire(import.meta.url);
const pkg = _require("./package.json") as { version: string };

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
    server: "src/server.ts",
  },
  format: ["esm"],
  target: "node20",
  outDir: "dist",
  clean: true,
  dts: true,
  sourcemap: true,
  noExternal: [/.*/],
  define: {
    __MCP_VERSION__: JSON.stringify(pkg.version),
  },
  banner: {
    js: "#!/usr/bin/env node",
  },
});
