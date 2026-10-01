// The salesforce plugin's own content, compose, and sensor validation.
//
// Run: bun test plugins/salesforce/tests/plugin.test.ts
// (also discovered by the integration tier: bash tests/run-tests.sh --integration --filter "plugin-salesforce")

import { NATIVE_FIXTURE_SETUP_TIMEOUT_MS } from "../../../tests/harness/test-budget.ts";
import { afterAll, beforeAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import { readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  composePluginFixture,
  validatePluginContent,
  walkMarkdownFiles,
  type ComposedPluginFixture,
} from "../../../tests/harness/plugin-kit.ts";
import { looksLikeRecordId, scanApex } from "../tools/aidlc-sensor-salesforce-apex-antipatterns.ts";
import { evaluate } from "../tools/aidlc-sensor-salesforce-apex-coverage.ts";
import { scanCss } from "../tools/aidlc-sensor-salesforce-lwc-styling.ts";

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
// Core stages the salesforce-classic route runs (classic's set minus
// infrastructure-design, plus ci-pipeline), joined to the route by adds.scopes.
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

const ruleIds = (source: string, file = "Example.cls"): string[] => scanApex(file, source).map((v) => v.rule);

describe("salesforce plugin content", () => {
  test("passes the reusable plugin content validator", () => {
    expect(validatePluginContent(PLUGIN_ROOT)).toEqual([]);
  });

  test("ships every plugin stage and one contribution per core route stage", () => {
    const stages = walkMarkdownFiles(join(PLUGIN_ROOT, "stages")).map((f) => f.replace(/\\/g, "/").split("/").pop());
    for (const slug of PLUGIN_STAGES) expect(stages).toContain(`${slug}.md`);
    const contributions = walkMarkdownFiles(join(PLUGIN_ROOT, "contributions")).map((f) =>
      readFileSync(f, "utf-8"),
    );
    for (const slug of CORE_ROUTE) {
      expect(contributions.some((c) => c.includes(`target: ${slug}\n`) && c.includes(`- ${SCOPE}`))).toBe(true);
    }
  });

  test("never anchors after a step whose body holds a fenced heading", () => {
    // after-step:<n> stops at the next ##/### line even inside a code fence, so
    // the plugin uses before-step anchors throughout.
    for (const file of walkMarkdownFiles(join(PLUGIN_ROOT, "contributions"))) {
      expect(readFileSync(file, "utf-8")).not.toMatch(/anchor: after-step:/);
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

  const dataFile = (name: string): unknown => {
    if (!fixture) throw new Error("fixture not composed");
    return JSON.parse(readFileSync(join(fixture.projectDir, ".claude", "tools", "data", name), "utf-8"));
  };

  test("composes with no drops", () => {
    expect(fixture?.dropLogs.trim() ?? "").toBe("");
  });

  test("salesforce-classic routes the plugin stages and the classic-style core stages", () => {
    const grid = dataFile("scope-grid.json") as Record<string, { stages: Record<string, string> }>;
    const route = grid[SCOPE]?.stages ?? {};
    for (const slug of [...PLUGIN_STAGES, ...CORE_ROUTE]) expect(route[slug]).toBe("EXECUTE");
    for (const slug of ["infrastructure-design", "intent-capture", "deployment-execution", "observability-setup"]) {
      expect(route[slug]).toBe("SKIP");
    }
  });

  test("plugin stages land after the core stages of their phase", () => {
    const graph = dataFile("stage-graph.json") as Array<{ slug: string; number: string }>;
    const order = (slug: string): number => graph.findIndex((s) => s.slug === slug);
    expect(order("salesforce-solution-design")).toBeGreaterThan(order("units-generation"));
    expect(order("salesforce-solution-design")).toBeLessThan(order("functional-design"));
    expect(order("salesforce-org-validation")).toBeGreaterThan(order("build-and-test"));
  });

  test("code-generation gains the Salesforce sensors and prose", () => {
    const graph = dataFile("stage-graph.json") as Array<{ slug: string; sensors_applicable?: Array<{ id: string }> }>;
    const codeGen = graph.find((s) => s.slug === "code-generation");
    const ids = (codeGen?.sensors_applicable ?? []).map((s) => s.id);
    expect(ids).toContain("salesforce-apex-antipatterns");
    expect(ids).toContain("salesforce-lwc-styling");
    if (!fixture) throw new Error("fixture not composed");
    const stage = readFileSync(
      join(fixture.projectDir, ".claude", "aidlc-common", "stages", "construction", "code-generation.md"),
      "utf-8",
    );
    expect(stage).toContain("### Step 3a (salesforce): Salesforce delegation context");
    expect(stage).toContain(".claude/knowledge/salesforce-developer-agent/salesforce-apex-guide.md");
    expect(stage).not.toContain("{{HARNESS_DIR}}");
  });
});

describe("salesforce-apex-antipatterns sensor", () => {
  test("flags SOQL and DML inside loops but not a SOQL for-loop header", () => {
    const src = `public with sharing class A {
  public static void run(List<Account> accts) {
    for (Account a : [SELECT Id FROM Account]) { }
    for (Account a : accts) {
      Contact c = [SELECT Id FROM Contact WHERE AccountId = :a.Id LIMIT 1];
      update a;
    }
  }
}`;
    const found = scanApex("A.cls", src);
    expect(found.filter((v) => v.rule === "soql-in-loop").map((v) => v.line)).toEqual([5]);
    expect(found.filter((v) => v.rule === "dml-in-loop").map((v) => v.line)).toEqual([6]);
  });

  test("ignores comments and string contents", () => {
    const src = `public with sharing class B {
  // for (X x : xs) { insert x; }
  String s = 'for (a : b) { update c; }';
}`;
    expect(ruleIds(src)).toEqual([]);
  });

  test("flags missing sharing, SeeAllData, hardcoded Ids, and empty catch", () => {
    const src = `public class C {
  Id acct = '001000000000001AAA';
  void m() { try { x(); } catch (Exception e) {} }
}`;
    expect(ruleIds(src)).toEqual(expect.arrayContaining(["missing-sharing", "hardcoded-id", "empty-catch"]));
    expect(ruleIds(`@IsTest(SeeAllData=true)\nprivate class CTest {}`)).toEqual(["see-all-data"]);
  });

  test("test classes need no sharing declaration and words are not record Ids", () => {
    expect(ruleIds(`@IsTest\nprivate class DTest { }`)).toEqual([]);
    expect(looksLikeRecordId("AccountTriggerHandler")).toBe(false);
    expect(looksLikeRecordId("0015g00000AbCdE")).toBe(true);
  });

  test("warns on logic inside a trigger body", () => {
    const trigger = `trigger AccountTrigger on Account (before insert) {
  for (Account a : Trigger.new) { a.Name = 'x'; }
}`;
    expect(ruleIds(trigger, "AccountTrigger.trigger")).toEqual(["logic-in-trigger"]);
    expect(ruleIds("trigger AccountTrigger on Account (before insert) { new AccountTriggerHandler().run(); }", "AccountTrigger.trigger")).toEqual([]);
  });
});

describe("salesforce-lwc-styling sensor", () => {
  const rules = (css: string): string[] => scanCss("lwc/card/card.css", css).map((v) => v.rule);

  test("allows hooks with fallbacks, including legacy tokens as fallbacks", () => {
    expect(
      rules(`.card { color: var(--slds-g-color-on-surface-1, #2e2e2e); padding: var(--slds-g-spacing-4, var(--lwc-spacingMedium)); }`),
    ).toEqual([]);
  });

  test("flags hardcoded colors, reassigned and component hooks, and deprecated tokens", () => {
    const found = rules(`#main .card {
  color: #ff0000;
  --slds-g-color-accent-1: red;
  border-color: var(--slds-c-card-color-border);
  background: var(--lwc-colorBackground);
  margin: 0 !important;
}`);
    expect(found).toEqual(
      expect.arrayContaining(["hardcoded-color", "reassigned-hook", "component-hook", "deprecated-token", "important"]),
    );
    expect(found.filter((r) => r === "hardcoded-color")).toHaveLength(1);
  });
});

describe("salesforce-apex-coverage sensor", () => {
  test("passes when tests pass and coverage meets targets", () => {
    const result = evaluate({
      summary: { failing: 0, org_wide_coverage_pct: 91 },
      classes: [{ name: "InvoiceService", coverage_pct: 95 }],
    });
    expect(result.pass).toBe(true);
    expect(result.targets).toEqual({ org_wide: 85, per_class: 75 });
  });

  test("reports failures, low coverage, and never accepts a target below the platform floor", () => {
    const result = evaluate({
      summary: { failing: 2, org_wide_coverage_pct: 70 },
      classes: [{ name: "InvoiceService", coverage_pct: 40 }],
      targets: { org_wide: 50, per_class: 75 },
    });
    expect(result.pass).toBe(false);
    expect(result.targets.org_wide).toBe(75);
    expect(result.findings_count).toBe(3);
    expect(result.classes_below_target).toEqual(["InvoiceService (40%)"]);
  });
});
