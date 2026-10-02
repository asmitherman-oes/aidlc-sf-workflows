// salesforce-doctor.ts — read-only /aidlc --doctor checks for the salesforce
// plugin. The Salesforce workflow does its work through Salesforce's own
// tooling, so missing tooling is an ERROR, not advice: the Salesforce DX MCP
// server with the expert toolsets, the forcedotcom/sf-skills skills, the sf CLI,
// and the core record-tool-calls hook the blocking gate depends on. Emits the
// plugin doctor JSON contract on stdout and nothing else.
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

// Toolsets whose tools the stages require (see the salesforce-tool-usage gate).
export const REQUIRED_TOOLSETS = [
  "orgs",
  "metadata",
  "data",
  "users",
  "testing",
  "code-analysis",
  "lwc-experts",
  "aura-experts",
  "scale-products",
  "experts-validation",
];

// A representative skill from each area the gate requires.
export const REQUIRED_SKILLS = [
  "platform-apex-generate",
  "platform-apex-test-generate",
  "platform-metadata-api-context-get",
  "platform-custom-object-generate",
  "platform-permission-set-generate",
  "automation-flow-generate",
  "experience-lwc-generate",
  "design-systems-slds-apply",
  "dx-code-analyzer-run",
  "platform-metadata-deploy",
];

const projectDir = process.env.AIDLC_PROJECT_DIR ?? process.cwd();
const harnessDir = process.env.AIDLC_HARNESS_DIR ?? ".claude";
const harnessRoot = join(projectDir, harnessDir);
const syncFix = `Run \`bun ${harnessDir}/tools/aidlc-utility.ts plugin-sync\` (or re-run the plugin's \`hooks/compose.ts\`).`;
const mcpFix =
  `claude mcp add salesforce-dx --scope project -- npx -y @salesforce/mcp --orgs DEFAULT_TARGET_ORG,DEFAULT_TARGET_DEV_HUB --toolsets ${REQUIRED_TOOLSETS.join(",")} --allow-non-ga-tools`;

function readText(path: string): string {
  try {
    return existsSync(path) ? readFileSync(path, "utf-8") : "";
  } catch {
    return "";
  }
}

// The args of every configured @salesforce/mcp server, from the Claude Code
// MCP config files this project can see.
export function salesforceMcpArgs(texts: string[]): string[][] {
  const found: string[][] = [];
  const visit = (node: unknown): void => {
    if (node === null || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    const args = Array.isArray(obj.args) ? obj.args.filter((a): a is string => typeof a === "string") : null;
    if (args?.some((a) => a.startsWith("@salesforce/mcp"))) found.push(args);
    for (const value of Object.values(obj)) visit(value);
  };
  for (const text of texts) {
    try {
      visit(JSON.parse(text));
    } catch {
      // Unreadable config: treated as absent.
    }
  }
  return found;
}

export function missingToolsets(args: string[]): string[] {
  const i = args.indexOf("--toolsets");
  if (i === -1) return [...REQUIRED_TOOLSETS];
  const enabled = new Set((args[i + 1] ?? "").split(",").map((s) => s.trim()));
  if (enabled.has("all")) return [];
  return REQUIRED_TOOLSETS.filter((t) => !enabled.has(t));
}

function skillInstalled(name: string): boolean {
  const roots = [
    join(projectDir, ".claude", "skills"),
    join(projectDir, ".agents", "skills"),
    join(homedir(), ".claude", "skills"),
    join(homedir(), ".agents", "skills"),
  ];
  return roots.some((root) => existsSync(join(root, name, "SKILL.md")));
}

function main(): void {
  const mcpConfigs = [
    join(projectDir, ".mcp.json"),
    join(harnessRoot, "settings.json"),
    join(harnessRoot, "settings.local.json"),
    join(homedir(), ".claude.json"),
  ].map(readText);
  const servers = salesforceMcpArgs(mcpConfigs);
  const toolsetGaps = servers.length === 0 ? REQUIRED_TOOLSETS : servers
    .map(missingToolsets)
    .reduce((best, gaps) => (gaps.length < best.length ? gaps : best));
  const missingSkills = REQUIRED_SKILLS.filter((s) => !skillInstalled(s));
  const settings = readText(join(harnessRoot, "settings.json"));

  const checks: Check[] = [
    {
      pass: existsSync(join(harnessRoot, "scopes", "salesforce-classic.md")),
      label: "scopes/salesforce-classic.md installed",
      fix: syncFix,
      severity: "error",
    },
    {
      pass: existsSync(join(harnessRoot, "sensors", "aidlc-salesforce-tool-usage.md")) &&
        existsSync(join(harnessRoot, "tools", "aidlc-sensor-salesforce-tool-usage.ts")),
      label: "salesforce-tool-usage gate sensor installed",
      fix: syncFix,
      severity: "error",
    },
    {
      pass: existsSync(join(harnessRoot, "knowledge", "aidlc-shared", "salesforce-tooling.md")),
      label: "knowledge/aidlc-shared/salesforce-tooling.md installed (Salesforce-first core)",
      fix: "Install the Salesforce-first AIDLC core from this fork (bun scripts/package.ts, then copy dist/claude).",
      severity: "error",
    },
    {
      pass: harnessDir !== ".claude" || settings.includes("engine hook record-tool-calls"),
      label: "record-tool-calls hook registered (feeds the salesforce-tool-usage gate)",
      fix: "Install the Salesforce-first AIDLC core from this fork; its .claude/settings.json registers the hook.",
      severity: "error",
    },
    {
      pass: servers.length > 0,
      label: "Salesforce DX MCP server (@salesforce/mcp) configured",
      fix: mcpFix,
      severity: "error",
    },
    {
      pass: servers.length > 0 && toolsetGaps.length === 0,
      label: `Salesforce DX MCP toolsets enabled (${REQUIRED_TOOLSETS.join(", ")})`,
      fix: `Missing: ${toolsetGaps.join(", ") || "none"}. ${mcpFix}`,
      severity: "error",
    },
    {
      pass: missingSkills.length === 0,
      label: "Salesforce agent skills (forcedotcom/sf-skills) installed",
      fix: `Missing: ${missingSkills.join(", ") || "none"}. Run: npx skills add forcedotcom/sf-skills`,
      severity: "error",
    },
    {
      pass: typeof Bun !== "undefined" && Bun.which("sf") !== null,
      label: "Salesforce CLI (sf) on PATH",
      fix: "npm install --global @salesforce/cli",
      severity: "error",
    },
    {
      pass: existsSync(join(projectDir, "sfdx-project.json")),
      label: "Salesforce DX project (sfdx-project.json) at the project root",
      fix: "Run `sf project generate --name <name>` or open the AIDLC project at the Salesforce DX project root.",
      severity: "advisory",
    },
  ];
  process.stdout.write(`${JSON.stringify({ checks })}\n`);
}

if (import.meta.main) main();
