import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const projectDir = process.env.AIDLC_PROJECT_DIR ?? process.cwd();
const configPath = join(projectDir, ".codex", "config.toml");
const hasProjectConfig = existsSync(configPath);
const config = hasProjectConfig ? readFileSync(configPath, "utf-8") : "";
const hasProjectMcp = /\[mcp_servers\.salesforce_dx\]/.test(config);

const checks = [
  {
    pass: existsSync(join(projectDir, "sfdx-project.json")),
    label: "Salesforce DX project detected",
    fix: "Run this scope from a Salesforce DX project containing sfdx-project.json.",
    severity: "error",
  },
  {
    pass: Boolean(Bun.which("sf")),
    label: "Salesforce CLI is available",
    fix: "Install Salesforce CLI and authorize an explicit sandbox or scratch-org alias.",
    severity: "error",
  },
  {
    pass: hasProjectMcp,
    label: "Project declares the Salesforce DX MCP server",
    fix:
      "Add [mcp_servers.salesforce_dx] to .codex/config.toml, or verify an equivalent user-level MCP configuration manually.",
    severity: "advisory",
  },
];

process.stdout.write(`${JSON.stringify({ checks })}\n`);
