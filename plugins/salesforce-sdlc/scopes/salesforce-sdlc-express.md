---
name: salesforce-sdlc-express
plugin: salesforce-sdlc
depth: Minimal
keywords:
  - salesforce demo
  - salesforce express
  - demo prototype
description: "Short Salesforce demo workflow for greenfield and brownfield projects"
skeleton: off
runner: true
review_cap: none
guard_policy: off
sensors: off
learnings: off
summary_confirmation: off
---

# Salesforce Express demos

Use the existing Express stage membership: three initialization stages,
Reverse Engineering, Requirements Analysis, Code Generation, Build and Test,
Deployment Pipeline, Deployment Execution, and Observability Setup. The other
23 stages are skipped. Conditional stages retain their own applicability checks;
a stage appearing in the compiled grid is not proof that it needs work.

## Demo-sized work

Agree one demo audience, one happy-path story, a small acceptance checklist,
the target sandbox or scratch-org alias, and explicit exclusions. Put the
minimum design decisions in the requirements and implementation plan; do not
start separate architecture, user-story, or unit-decomposition work. Prefer
standard Salesforce features, configuration, Flow, and base Lightning components.
Preserve required core artifact sections but keep their contents concise.

For greenfield work, start from a Salesforce DX project skeleton. Confirm the
available org capabilities and use synthetic demo data. An empty repository
does not prove the connected org is empty. For brownfield work, inspect only
the objects, automation, permissions, and dependencies touched by the demo.
Reuse existing components and record source/org gaps. Follow the existing
reverse-engineering contract when it applies; keep discovery bounded to the
demo instead of auditing the whole agency org.

Test the chosen happy path and the relevant permission/error path. Add Apex,
LWC, or Flow checks only where those components change, while satisfying
Salesforce deployment requirements. Keep bulk behavior and CRUD/FLS enforcement
for generated Apex. Distinguish working behavior from mocks and unverified work.

Use an existing approved sandbox or scratch org; this scope does not provision
environments. Reuse the existing deployment mechanism. Keep deployment setup
and observability limited to the commands, smoke check, and logs needed for the
demo; do not create a CI platform or monitoring stack just for the prototype.
If the intent requests local-only work, explicitly record deployment as not
applicable using the normal stage protocol.

## Demo handoff

Record how to launch the demo, its synthetic data, known limitations, reset or
cleanup steps, and production-readiness gaps in the existing test/deployment
artifacts. A demo is not a production-readiness approval.

Express disables formal reviewers, sensors, and strict workflow guards. It does
not authorize org writes: require explicit authorization for deployment,
activation, permission assignments, or data changes. Never infer that a
production org is an acceptable demo target.

