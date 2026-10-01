// salesforce-doctor.ts — read-only /aidlc --doctor checks for the salesforce
// plugin. Verifies the composed surfaces (error) and the Salesforce toolchain
// the stages rely on (advisory): the sf CLI, a Salesforce DX project, and a
// configured Salesforce DX MCP server. Emits the plugin doctor JSON contract on
// stdout and nothing else.
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

type Severity = "error" | "advisory";

interface Check {
  pass: boolean;
  label: string;
  fix: string;
  severity: Severity;
}

const projectDir = process.env.AIDLC_PROJECT_DIR ?? process.cwd();
const harnessDir = process.env.AIDLC_HARNESS_DIR ?? ".claude";
const harnessRoot = join(projectDir, harnessDir);
const syncFix = `Run \`bun ${harnessDir}/tools/aidlc-utility.ts plugin-sync\` (or re-run the plugin's \`hooks/compose.ts\`).`;

function installed(relativePath: string, severity: Severity): Check {
  return {
    pass: existsSync(join(harnessRoot, relativePath)),
    label: `${relativePath} installed`,
    fix: syncFix,
    severity,
  };
}

function readText(path: string): string {
  try {
    return existsSync(path) ? readFileSync(path, "utf-8") : "";
  } catch {
    return "";
  }
}

// A Salesforce DX MCP server is configured when a Claude Code MCP config names
// the @salesforce/mcp package or a server key containing "salesforce".
function salesforceMcpConfigured(): boolean {
  const sources = [
    join(projectDir, ".mcp.json"),
    join(harnessRoot, "settings.json"),
    join(harnessRoot, "settings.local.json"),
    join(homedir(), ".claude.json"),
  ];
  return sources.some((path) => {
    const text = readText(path);
    return text.includes("@salesforce/mcp") || /"[^"]*salesforce[^"]*"\s*:\s*\{\s*"(?:command|type|url)"/i.test(text);
  });
}

const sfOnPath = typeof Bun !== "undefined" && Bun.which("sf") !== null;

const checks: Check[] = [
  installed("scopes/salesforce-classic.md", "error"),
  installed("agents/salesforce-architect-agent.md", "error"),
  installed("agents/salesforce-technical-reviewer-agent.md", "error"),
  installed("sensors/aidlc-salesforce-apex-antipatterns.md", "error"),
  installed("sensors/aidlc-salesforce-lwc-styling.md", "error"),
  installed("sensors/aidlc-salesforce-apex-coverage.md", "error"),
  installed("tools/aidlc-sensor-salesforce-apex-antipatterns.ts", "error"),
  installed("tools/aidlc-sensor-salesforce-lwc-styling.ts", "error"),
  installed("tools/aidlc-sensor-salesforce-apex-coverage.ts", "error"),
  installed("knowledge/salesforce-devops-agent/salesforce-dx-mcp-tools.md", "error"),
  {
    pass: sfOnPath,
    label: "Salesforce CLI (sf) on PATH",
    fix: "Install the Salesforce CLI: npm install --global @salesforce/cli",
    severity: "advisory",
  },
  {
    pass: existsSync(join(projectDir, "sfdx-project.json")),
    label: "Salesforce DX project (sfdx-project.json) at the project root",
    fix: "Run `sf project generate --name <name>` or open the AIDLC project at the Salesforce DX project root.",
    severity: "advisory",
  },
  {
    pass: salesforceMcpConfigured(),
    label: "Salesforce DX MCP server configured",
    fix: "claude mcp add salesforce-dx -- npx -y @salesforce/mcp --orgs DEFAULT_TARGET_ORG --toolsets all",
    severity: "advisory",
  },
];

process.stdout.write(`${JSON.stringify({ checks })}\n`);
