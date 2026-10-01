// aidlc-sensor-salesforce-apex-coverage.ts — ADVISORY Apex test and coverage
// gate (salesforce plugin).
//
// Reads the salesforce-apex-test-results.json side-input that Salesforce Org
// Validation writes from the run_apex_test result, and reports failing tests,
// org-wide coverage below target, and touched classes below the per-class
// target. Targets travel inside the JSON (`targets`), falling back to embedded
// defaults; an authored target below the 75% platform deployment floor is
// raised to the floor. The dispatcher fires on every write under the record
// dir, so any other path is a clean pass-through.
import { existsSync, readFileSync } from "node:fs";

const PLATFORM_FLOOR = 75;
const DEFAULT_TARGETS = { org_wide: 85, per_class: 75 };
const RESULTS_FILE = "salesforce-apex-test-results.json";

interface Targets {
  org_wide: number;
  per_class: number;
}

interface Result {
  pass: boolean;
  findings_count: number;
  failing: number;
  org_wide_coverage_pct: number;
  classes_below_target: string[];
  targets: Targets;
}

interface ResultsJson {
  summary?: { failing?: unknown; org_wide_coverage_pct?: unknown };
  classes?: Array<{ name?: unknown; coverage_pct?: unknown }>;
  targets?: { org_wide?: unknown; per_class?: unknown };
}

function parseOutputPath(argv: string[]): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--output-path" || argv[i] === "--file-path") return argv[i + 1];
  }
  return undefined;
}

const num = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export function evaluate(parsed: ResultsJson): Result {
  const targets: Targets = {
    org_wide: Math.max(PLATFORM_FLOOR, num(parsed.targets?.org_wide, DEFAULT_TARGETS.org_wide)),
    per_class: num(parsed.targets?.per_class, DEFAULT_TARGETS.per_class),
  };
  const failing = num(parsed.summary?.failing, 0);
  const orgWide = num(parsed.summary?.org_wide_coverage_pct, 0);
  const classesBelow = (parsed.classes ?? [])
    .filter((c) => typeof c.name === "string" && num(c.coverage_pct, 0) < targets.per_class)
    .map((c) => `${String(c.name)} (${num(c.coverage_pct, 0)}%)`);
  const findings = (failing > 0 ? 1 : 0) + (orgWide < targets.org_wide ? 1 : 0) + classesBelow.length;
  return {
    pass: findings === 0,
    findings_count: findings,
    failing,
    org_wide_coverage_pct: orgWide,
    classes_below_target: classesBelow,
    targets,
  };
}

function main(): void {
  const outputPath = parseOutputPath(process.argv.slice(2));
  if (!outputPath) {
    process.stderr.write("aidlc-sensor-salesforce-apex-coverage: --output-path is required\n");
    process.exit(1);
  }
  const passThrough = (): never => {
    process.stdout.write(
      `${JSON.stringify({ pass: true, findings_count: 0, failing: 0, org_wide_coverage_pct: 0, classes_below_target: [], targets: DEFAULT_TARGETS })}\n`,
    );
    process.exit(0);
  };
  if (!outputPath.replaceAll("\\", "/").endsWith(`/${RESULTS_FILE}`) && outputPath !== RESULTS_FILE) passThrough();
  if (!existsSync(outputPath)) passThrough();
  let parsed: ResultsJson;
  try {
    parsed = JSON.parse(readFileSync(outputPath, "utf-8")) as ResultsJson;
  } catch (err) {
    process.stderr.write(
      `aidlc-sensor-salesforce-apex-coverage: failed to parse ${outputPath}: ${err instanceof Error ? err.message : String(err)}\n`,
    );
    process.exit(1);
  }
  process.stdout.write(`${JSON.stringify(evaluate(parsed))}\n`);
}

if (import.meta.main) main();
