// The salesforce plugin's own content, compose, gate-sensor, and doctor validation.
//
// Run: bun test plugins/salesforce/tests/plugin.test.ts
// (also discovered by the integration tier: bash tests/run-tests.sh --integration --filter "plugin-salesforce")

import { NATIVE_FIXTURE_SETUP_TIMEOUT_MS } from "../../../tests/harness/test-budget.ts";
import { afterAll, beforeAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  composePluginFixture,
  validatePluginContent,
  walkMarkdownFiles,
  type ComposedPluginFixture,
} from "../../../tests/harness/plugin-kit.ts";
import { classifyToolCall } from "../../../core/hooks/aidlc-record-tool-calls.ts";
import { evaluate } from "../tools/aidlc-sensor-salesforce-apex-coverage.ts";
import {
  codeGenerationRequirements,
  evaluateRequirements,
  STAGE_REQUIREMENTS,
} from "../tools/aidlc-sensor-salesforce-tool-usage.ts";
import { missingToolsets, salesforceMcpArgs } from "../tools/salesforce-doctor.ts";

setDefaultTimeout(NATIVE_FIXTURE_SETUP_TIMEOUT_MS);

const PLUGIN_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCOPE = "salesforce-classic";
const PLUGIN_STAGES = [
  "salesforce-org-analysis",
  "salesforce-solution-design",
  "salesforce-data-model-design",
  "salesforce-security-model-design",
  "salesforce-org-validation",
  "salesforce-release-deployment",
];
const CORE_ROUTE = [
  "reverse-engineering",
  "practices-discovery",
  "requirements-analysis",
  "user-stories",
  "refined-mockups",
  "domain-design",
  "units-generation",
  "contract-design",
  "delivery-planning",
  "functional-design",
  "nfr-requirements",
  "nfr-design",
  "code-generation",
  "build-and-test",
  "ci-pipeline",
];

describe("salesforce plugin content", () => {
  test("passes the reusable plugin content validator", () => {
    expect(validatePluginContent(PLUGIN_ROOT)).toEqual([]);
  });

  test("plugin stages are led by existing AIDLC agents, not plugin-owned ones", () => {
    for (const file of walkMarkdownFiles(join(PLUGIN_ROOT, "stages"))) {
      const text = readFileSync(file, "utf-8");
      const agents = [...text.matchAll(/^(?:lead_agent|reviewer):\s*(\S+)|^ {2}- (aidlc-[a-z-]+-agent)$/gm)]
        .map((m) => m[1] ?? m[2]);
      expect(agents.length).toBeGreaterThan(0);
      for (const agent of agents) expect(agent).toMatch(/^aidlc-[a-z-]+-agent$/);
      expect(text).toContain("- salesforce-tool-usage");
    }
  });

  test("every core route stage is contributed and no fragment anchors after a step", () => {
    const contributions = walkMarkdownFiles(join(PLUGIN_ROOT, "contributions")).map((f) => readFileSync(f, "utf-8"));
    for (const slug of CORE_ROUTE) {
      expect(contributions.some((c) => c.includes(`target: ${slug}\n`) && c.includes(`- ${SCOPE}`))).toBe(true);
    }
    for (const c of contributions) expect(c).not.toMatch(/anchor: after-step:/);
  });

  test("every gated stage has requirements, and every skill named is an sf-skills id shape", () => {
    for (const slug of PLUGIN_STAGES) expect(STAGE_REQUIREMENTS[slug]?.length ?? 0).toBeGreaterThan(0);
    for (const reqs of Object.values(STAGE_REQUIREMENTS)) {
      for (const id of reqs.flatMap((r) => r.anyOf)) expect(id).toMatch(/^(skill:[a-z0-9-]+|mcp:[a-z_]+)$/);
    }
  });
});

describe("salesforce plugin composes into a Claude install", () => {
  let fixture: ComposedPluginFixture | undefined;

  beforeAll(() => {
    fixture = composePluginFixture({ plugin: "salesforce", harness: "claude" });
  });

  afterAll(() => {
    if (fixture) rmSync(dirname(fixture.projectDir), { recursive: true, force: true });
  });

  const data = (name: string): unknown => {
    if (!fixture) throw new Error("fixture not composed");
    return JSON.parse(readFileSync(join(fixture.projectDir, ".claude", "tools", "data", name), "utf-8"));
  };

  test("composes with no drops", () => {
    expect(fixture?.dropLogs.trim() ?? "").toBe("");
  });

  test("salesforce-classic routes the plugin stages and the classic-style core stages", () => {
    const grid = data("scope-grid.json") as Record<string, { stages: Record<string, string> }>;
    const route = grid[SCOPE]?.stages ?? {};
    for (const slug of [...PLUGIN_STAGES, ...CORE_ROUTE]) expect(route[slug]).toBe("EXECUTE");
    for (const slug of ["infrastructure-design", "intent-capture", "deployment-execution"]) expect(route[slug]).toBe("SKIP");
  });

  test("the gate sensor is bound as blocking and gate-fired where work is checked", () => {
    const graph = data("stage-graph.json") as Array<{
      slug: string;
      sensors_applicable?: Array<{ id: string; fire_on?: string; default_severity?: string }>;
    }>;
    for (const slug of [...PLUGIN_STAGES, "code-generation", "build-and-test", "refined-mockups"]) {
      const gate = graph.find((s) => s.slug === slug)?.sensors_applicable?.find((x) => x.id === "salesforce-tool-usage");
      expect(gate?.fire_on).toBe("gate");
      expect(gate?.default_severity).toBe("blocking");
    }
  });

  test("the Salesforce-first core ships the routing knowledge and the recording hook", () => {
    if (!fixture) throw new Error("fixture not composed");
    const root = join(fixture.projectDir, ".claude");
    expect(readFileSync(join(root, "knowledge", "aidlc-shared", "salesforce-tooling.md"), "utf-8")).toContain("platform-apex-generate");
    expect(readFileSync(join(root, "settings.json"), "utf-8")).toContain("engine hook record-tool-calls");
    expect(readFileSync(join(root, "agents", "aidlc-developer-agent.md"), "utf-8")).toContain("## Salesforce Platform");
  });
});

describe("record-tool-calls hook classification", () => {
  test("records MCP tools, Skill calls, and SKILL.md reads only", () => {
    expect(classifyToolCall("mcp__salesforce-dx__run_code_analyzer", {})).toEqual({
      kind: "mcp",
      tool: "run_code_analyzer",
      server: "salesforce-dx",
    });
    expect(classifyToolCall("Skill", { skill: "platform-apex-generate" })?.tool).toBe("platform-apex-generate");
    expect(classifyToolCall("Read", { file_path: "/p/.claude/skills/automation-flow-generate/SKILL.md" })?.tool).toBe(
      "automation-flow-generate",
    );
    expect(classifyToolCall("Read", { file_path: "/p/force-app/main/default/classes/A.cls" })).toBeNull();
    expect(classifyToolCall("Write", { file_path: "x" })).toBeNull();
  });
});

describe("salesforce-tool-usage gate sensor", () => {
  test("code generation requirements follow the Salesforce metadata written", () => {
    const labels = codeGenerationRequirements([
      "force-app/main/default/classes/InvoiceService.cls",
      "force-app/main/default/classes/InvoiceServiceTest.cls",
      "force-app/main/default/lwc/invoiceCard/invoiceCard.css",
      "force-app/main/default/objects/Invoice__c/fields/Amount__c.field-meta.xml",
      "force-app/main/default/flows/Invoice_Notify.flow-meta.xml",
    ]).map((r) => r.label);
    expect(labels).toEqual(
      expect.arrayContaining([
        "Apex authoring",
        "Apex antipattern / static scan",
        "Apex test generation",
        "LWC authoring",
        "LWC Jest tests",
        "SLDS styling",
        "custom field metadata",
        "Flow metadata",
        "metadata schema companion for generated metadata",
      ]),
    );
    expect(codeGenerationRequirements(["README.md"])).toEqual([]);
  });

  test("passes only when every requirement has a recorded call", () => {
    const reqs = STAGE_REQUIREMENTS["salesforce-org-validation"] ?? [];
    const partial = evaluateRequirements(reqs, [
      { kind: "mcp", tool: "deploy_metadata" },
      { kind: "mcp", tool: "run_apex_test" },
    ]);
    expect(partial.pass).toBe(false);
    expect(partial.missing.map((m) => m.requirement)).toEqual(["Salesforce Code Analyzer"]);
    const full = evaluateRequirements(reqs, [
      { kind: "mcp", tool: "deploy_metadata" },
      { kind: "skill", tool: "platform-apex-test-run" },
      { kind: "skill", tool: "dx-code-analyzer-run" },
    ]);
    expect(full.pass).toBe(true);
  });

  test("reads the ledger beside the record and the unit's source manifest", () => {
    const tmp = mkdtempSync(join(tmpdir(), "sf-gate-"));
    try {
      const record = join(tmp, "aidlc", "spaces", "default", "intents", "i1");
      const unitDir = join(record, "construction", "u1", "code-generation");
      mkdirSync(unitDir, { recursive: true });
      mkdirSync(join(record, ".aidlc-engine", "tool-calls"), { recursive: true });
      writeFileSync(join(unitDir, "code-summary.md"), "# Summary\n");
      writeFileSync(
        join(unitDir, "source-manifest.json"),
        JSON.stringify({ stage: "code-generation", unit: "u1", version: 1, writes: [{ path: "force-app/main/default/classes/A.cls" }] }),
      );
      const ledger = join(record, ".aidlc-engine", "tool-calls", "code-generation.jsonl");
      const run = () =>
        JSON.parse(
          spawnSync(
            process.execPath,
            [join(PLUGIN_ROOT, "tools", "aidlc-sensor-salesforce-tool-usage.ts"), "--stage", "code-generation", "--output-path", join(unitDir, "code-summary.md")],
            { encoding: "utf-8" },
          ).stdout,
        );
      writeFileSync(ledger, `${JSON.stringify({ stage: "code-generation", unit: "u1", kind: "skill", tool: "platform-apex-generate" })}\n`);
      expect(run().pass).toBe(false);
      writeFileSync(
        ledger,
        `${JSON.stringify({ stage: "code-generation", unit: "u1", kind: "skill", tool: "platform-apex-generate" })}\n${JSON.stringify({ stage: "code-generation", unit: "u1", kind: "mcp", tool: "scan_apex_class_for_antipatterns" })}\n`,
      );
      expect(run().pass).toBe(true);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("salesforce doctor helpers", () => {
  test("detects the Salesforce DX MCP server and its missing toolsets", () => {
    const args = salesforceMcpArgs([
      JSON.stringify({ mcpServers: { sf: { command: "npx", args: ["-y", "@salesforce/mcp", "--orgs", "X", "--toolsets", "orgs,metadata"] } } }),
    ]);
    expect(args).toHaveLength(1);
    expect(missingToolsets(args[0] ?? [])).toContain("lwc-experts");
    expect(missingToolsets(["@salesforce/mcp", "--toolsets", "all"])).toEqual([]);
  });
});

describe("salesforce-apex-coverage sensor", () => {
  test("never accepts a target below the platform floor", () => {
    const result = evaluate({
      summary: { failing: 0, org_wide_coverage_pct: 70 },
      classes: [{ name: "A", coverage_pct: 90 }],
      targets: { org_wide: 50, per_class: 75 },
    });
    expect(result.pass).toBe(false);
    expect(result.targets.org_wide).toBe(75);
  });
});
