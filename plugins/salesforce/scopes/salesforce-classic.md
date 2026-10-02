---
name: salesforce-classic
plugin: salesforce
depth: Standard
keywords:
  - salesforce
  - apex
  - lightning web component
  - lwc
  - sfdx
  - salesforce dx
  - scratch org
  - sobject
  - salesforce flow
description: "Classic-style Inception and Construction for Salesforce application development, with Salesforce design, org validation, and release stages"
skeleton: off
review_cap: advisory
guard_policy: off
sensors: on
learnings: on
summary_confirmation: off
plan_approval: on
runner: true
---

# salesforce-classic scope

`salesforce-classic` is the `classic` workflow profile re-cut for Salesforce
platform delivery. It keeps classic's v1-style ceremony, with one human approval
per stage, and keeps the existing AIDLC agents. It covers Salesforce DX source
projects, Apex, Lightning Web Components, Flows, custom objects, and the
security model. The agents do the underlying Salesforce work through Salesforce's
own tooling: the agent skills in `forcedotcom/sf-skills` and the Salesforce DX
MCP server. The salesforce plugin adds Salesforce-specific questions,
artifacts, and the required skill and tool calls to the core Inception and
Construction stages. It then adds Salesforce design, org validation, and release
stages. A blocking gate sensor, `salesforce-tool-usage`, checks the recorded
skill and tool calls before each of those stages is approved.

Settings match `classic`: Standard depth and test strategy, advisory reviews
(one pass, findings shown at the approval gate), Guard Policy off, sensors and
learnings on, summary confirmation off, and Plan Approval on for Code
Generation. Override per intent with the usual `/aidlc --sensors`,
`--learnings`, `--summary-confirmation`, `--plan-approval`, `--depth`, and
`--review` controls.

## Why these stages, why skip those

Ideation is skipped, as in classic. The facilitator or product owner brings the
intent, and Salesforce feasibility questions belong in Requirements Analysis.
The plugin's requirements-analysis contribution asks them: org edition,
licenses, clouds, data volumes, and AppExchange dependencies.

Inception keeps every core stage classic keeps. Salesforce questions and
artifacts are added to Requirements Analysis, User Stories, Refined Mockups,
Domain Design, and Units Generation. The engine places plugin stages after the
core stages of their phase, so four Salesforce stages close Inception, after
units and the delivery plan are known and before any code is written:

- **Salesforce Org Analysis** (conditional): reads a connected org through the
  Salesforce DX MCP server to find existing metadata, automation, limits, and
  conflicts.
- **Salesforce Solution Design**: decides between declarative and programmatic
  work, standard and custom objects, the packaging and environment strategy, and
  how metadata maps to Units. The Salesforce Technical Reviewer reviews it.
- **Salesforce Data Model Design** (conditional): defines objects, fields,
  relationships, record types, and data volumes.
- **Salesforce Security Model Design** (conditional): defines OWD, role
  hierarchy, sharing, permission sets, CRUD/FLS, and how Apex enforces them.

Construction keeps classic's per-Unit Functional Design, NFR Requirements, NFR
Design, Code Generation, and Build and Test. Each gains Salesforce guidance:
automation design and order of execution, governor-limit budgets, async
patterns, Apex/LWC/Flow code generation, and Apex and Jest test execution.
Infrastructure Design is skipped because its lead is the AWS platform agent and
a Salesforce org is not AWS infrastructure. The environment and org strategy
moves into Salesforce Solution Design. CI Pipeline is conditional and gains
Salesforce CLI guidance. **Salesforce Org Validation** closes Construction. It
deploys the source to a scratch org or sandbox, runs Apex tests with coverage,
and runs static analysis. It never targets production.

Operation is skipped, as in classic, except for the conditional **Salesforce
Release Deployment** stage. That stage plans and runs a validated, quick-deploy
release to sandbox, UAT, or production, but only when the human asks for a
release.

## Membership

Initialization always runs. Inception includes Reverse Engineering, Practices
Discovery, Requirements Analysis, User Stories, Refined Mockups, Domain Design,
Units Generation, Contract Design, Delivery Planning, Salesforce Org Analysis,
Salesforce Solution Design, Salesforce Data Model Design, and Salesforce
Security Model Design. Construction includes Functional Design, NFR
Requirements, NFR Design, Code Generation, Build and Test, CI Pipeline, and
Salesforce Org Validation. Operation includes only Salesforce Release
Deployment. Ideation, Infrastructure Design, and the other core Operation stages
are SKIP.

Keyword triggers: `salesforce`, `apex`, `lightning web component`, `lwc`,
`sfdx`, `salesforce dx`, `scratch org`, `sobject`, `salesforce flow`. Start it
explicitly with `/salesforce-classic` (the generated scope runner) or
`/aidlc --scope salesforce-classic`.
