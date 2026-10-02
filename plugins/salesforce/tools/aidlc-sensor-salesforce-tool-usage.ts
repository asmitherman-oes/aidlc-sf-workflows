// aidlc-sensor-salesforce-tool-usage.ts — BLOCKING gate check that a stage did
// its Salesforce work through Salesforce's own skills (forcedotcom/sf-skills)
// and Salesforce DX MCP tools (salesforce plugin).
//
// Fires once per declared deliverable immediately before the approval gate
// (`fire_on: gate`). Reads the tool-call ledger the core `record-tool-calls`
// hook writes from Claude Code's PostToolUse events —
// `<record>/.aidlc-engine/tool-calls/<stage>.jsonl` — and checks the stage's
// required calls. For Code Generation the requirements follow the Salesforce
// metadata the Unit's `source-manifest.json` says it wrote (Apex needs
// platform-apex-generate + an Apex scan, LWC needs the LWC experts, a Flow
// needs automation-flow-generate, ...). A missing call is a finding; the gate
// stays closed until it is made or the human overrides.
//
// Output: {"pass", "findings_count", "stage", "unit", "missing": [{requirement,
// any_of}], "recorded": [...]}. Exit 0 for pass or fail.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";

export interface Requirement {
  label: string;
  anyOf: string[]; // "skill:<name>" | "mcp:<tool>"
}

export interface LedgerEntry {
  stage?: string;
  unit?: string | null;
  kind?: string;
  tool?: string;
}

const APEX_SCAN = ["mcp:scan_apex_class_for_antipatterns", "mcp:run_code_analyzer", "skill:dx-code-analyzer-run"];
const CODE_ANALYZER = ["mcp:run_code_analyzer", "skill:dx-code-analyzer-run"];
const METADATA_CONTEXT: Requirement = {
  label: "metadata schema companion for generated metadata",
  anyOf: ["skill:platform-metadata-api-context-get"],
};

// Fixed per-stage requirements (Code Generation is path-driven, below).
export const STAGE_REQUIREMENTS: Record<string, Requirement[]> = {
  "salesforce-org-analysis": [
    { label: "resolve the target org", anyOf: ["mcp:list_all_orgs", "mcp:get_username", "skill:dx-org-analyze"] },
    { label: "query or inventory the org", anyOf: ["mcp:run_soql_query", "skill:dx-org-analyze", "skill:platform-soql-query"] },
  ],
  "salesforce-solution-design": [
    {
      label: "consult Salesforce sources for the design",
      anyOf: ["skill:platform-docs-get", "skill:platform-data-and-tooling-api-context-get", "skill:platform-metadata-api-context-get"],
    },
  ],
  "salesforce-data-model-design": [
    { label: "object/field metadata rules", anyOf: ["skill:platform-custom-object-generate", "skill:platform-custom-field-generate"] },
    {
      label: "standard object / schema reference",
      anyOf: ["skill:platform-data-and-tooling-api-context-get", "skill:platform-metadata-api-context-get"],
    },
  ],
  "salesforce-security-model-design": [
    { label: "sharing model", anyOf: ["skill:platform-sharing-owd-configure", "skill:platform-sharing-rules-generate"] },
    { label: "permission set design", anyOf: ["skill:platform-permission-set-generate"] },
  ],
  "refined-mockups": [
    {
      label: "Lightning base components / SLDS",
      anyOf: ["skill:design-systems-slds-apply", "mcp:guide_lbc_usage", "mcp:explore_lbc_components"],
    },
  ],
  "build-and-test": [{ label: "Salesforce Code Analyzer", anyOf: CODE_ANALYZER }],
  "salesforce-org-validation": [
    { label: "deploy to the validation org", anyOf: ["mcp:deploy_metadata", "skill:platform-metadata-deploy"] },
    { label: "run Apex tests with coverage", anyOf: ["mcp:run_apex_test", "skill:platform-apex-test-run"] },
    { label: "Salesforce Code Analyzer", anyOf: CODE_ANALYZER },
  ],
  "salesforce-release-deployment": [
    { label: "deploy through Salesforce tooling", anyOf: ["mcp:deploy_metadata", "skill:platform-metadata-deploy"] },
  ],
};

const GENERATION_SKILLS = [
  "skill:platform-apex-generate",
  "skill:experience-lwc-generate",
  "skill:platform-custom-object-generate",
  "skill:platform-custom-field-generate",
  "skill:automation-flow-generate",
  "skill:platform-permission-set-generate",
  "mcp:orchestrate_lwc_component_creation",
];

// Code Generation requirements derived from the paths a Unit wrote.
export function codeGenerationRequirements(paths: string[] | null): Requirement[] {
  if (paths === null) {
    return [{ label: "generate Salesforce source with a Salesforce skill", anyOf: GENERATION_SKILLS }];
  }
  const p = paths.map((x) => x.replaceAll("\\", "/"));
  const has = (re: RegExp): boolean => p.some((x) => re.test(x));
  const req: Requirement[] = [];
  const isTest = /(?:Test|_Test|Tests)\.cls$/;
  if (p.some((x) => /\.(cls|trigger)$/.test(x) && !isTest.test(x)) || has(/\/(classes|triggers)\/$/)) {
    req.push({ label: "Apex authoring", anyOf: ["skill:platform-apex-generate"] });
    req.push({ label: "Apex antipattern / static scan", anyOf: APEX_SCAN });
  }
  if (p.some((x) => isTest.test(x))) {
    req.push({ label: "Apex test generation", anyOf: ["skill:platform-apex-test-generate"] });
  }
  if (has(/\/lwc\//)) {
    req.push({
      label: "LWC authoring",
      anyOf: [
        "skill:experience-lwc-generate",
        "mcp:orchestrate_lwc_component_creation",
        "mcp:guide_lwc_development",
        "mcp:create_lwc_component_from_prd",
      ],
    });
    req.push({
      label: "LWC Jest tests",
      anyOf: ["mcp:create_lwc_jest_tests", "mcp:review_lwc_jest_tests", "mcp:orchestrate_lwc_component_testing", "skill:experience-lwc-generate"],
    });
  }
  if (has(/\/lwc\/.+\.css$/)) {
    req.push({
      label: "SLDS styling",
      anyOf: ["skill:design-systems-slds-apply", "skill:design-systems-slds-validate", "mcp:guide_slds_styling"],
    });
  }
  if (has(/\/aura\//)) {
    req.push({
      label: "Aura migration",
      anyOf: ["skill:experience-aura-lwc-migrate", "mcp:orchestrate_aura_migration", "mcp:create_aura_blueprint_draft"],
    });
  }
  const metadata: Array<[RegExp, string, string]> = [
    [/\.object-meta\.xml$/, "custom object metadata", "skill:platform-custom-object-generate"],
    [/\.field-meta\.xml$/, "custom field metadata", "skill:platform-custom-field-generate"],
    [/\.validationRule-meta\.xml$/, "validation rule metadata", "skill:platform-validation-rule-generate"],
    [/\.flow-meta\.xml$|\/flows\/$/, "Flow metadata", "skill:automation-flow-generate"],
    [/\.permissionset-meta\.xml$|\/permissionsets\/$/, "permission set metadata", "skill:platform-permission-set-generate"],
    [/\.flexipage-meta\.xml$|\/flexipages\/$/, "Lightning page metadata", "skill:platform-flexipage-generate"],
    [/__mdt\/|\.md-meta\.xml$|\/customMetadata\/$/, "Custom Metadata Type", "skill:platform-custom-metadata-type-generate"],
  ];
  let anyMetadata = false;
  for (const [re, label, skill] of metadata) {
    if (has(re)) {
      anyMetadata = true;
      req.push({ label, anyOf: [skill] });
    }
  }
  if (anyMetadata) req.push(METADATA_CONTEXT);
  return req;
}

export function evaluateRequirements(requirements: Requirement[], entries: LedgerEntry[]) {
  const recorded = new Set(
    entries.filter((e) => e.kind && e.tool).map((e) => `${e.kind}:${e.tool}`),
  );
  const missing = requirements
    .filter((r) => !r.anyOf.some((id) => recorded.has(id)))
    .map((r) => ({ requirement: r.label, any_of: r.anyOf }));
  return { pass: missing.length === 0, findings_count: missing.length, missing, recorded: [...recorded].sort() };
}

function parseFlags(argv: string[]): { stage?: string; outputPath?: string } {
  const out: { stage?: string; outputPath?: string } = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--stage") out.stage = argv[i + 1];
    else if (argv[i] === "--output-path" || argv[i] === "--file-path") out.outputPath = argv[i + 1];
  }
  return out;
}

// The record root is the nearest ancestor holding the engine directory.
function findRecordRoot(start: string): string | null {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, ".aidlc-engine"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function readLedger(path: string): LedgerEntry[] {
  if (!existsSync(path)) return [];
  const out: LedgerEntry[] = [];
  for (const line of readFileSync(path, "utf-8").split("\n")) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line) as LedgerEntry);
    } catch {
      // A torn line is skipped; the rest of the ledger still counts.
    }
  }
  return out;
}

function main(): void {
  const { stage, outputPath } = parseFlags(process.argv.slice(2));
  if (!stage || !outputPath) {
    process.stderr.write("aidlc-sensor-salesforce-tool-usage: --stage and --output-path are required\n");
    process.exit(1);
  }
  const absOutput = resolve(outputPath);
  const outDir = dirname(absOutput);
  let unit: string | null = null;
  let requirements: Requirement[];
  if (stage === "code-generation") {
    const m = /[\\/]construction[\\/]([^\\/]+)[\\/]code-generation$/.exec(outDir);
    unit = m ? m[1] : null;
    const manifestPath = join(outDir, "source-manifest.json");
    let paths: string[] | null = null;
    if (existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as { writes?: Array<{ path?: unknown }> };
        paths = (manifest.writes ?? []).map((w) => (typeof w.path === "string" ? w.path : "")).filter(Boolean);
      } catch {
        paths = null;
      }
    }
    requirements = codeGenerationRequirements(paths);
  } else {
    requirements = STAGE_REQUIREMENTS[stage] ?? [];
  }
  const record = findRecordRoot(outDir);
  const entries = record
    ? readLedger(join(record, ".aidlc-engine", "tool-calls", `${stage}.jsonl`)).filter(
        (e) => unit === null || e.unit === unit || e.unit === null || e.unit === undefined,
      )
    : [];
  const result = evaluateRequirements(requirements, entries);
  process.stdout.write(
    `${JSON.stringify({ ...result, stage, unit, ledger: record ? join(record, ".aidlc-engine", "tool-calls").split(sep).join("/") : null })}\n`,
  );
}

if (import.meta.main) main();
