---
name: salesforce-sdlc-standard
plugin: salesforce-sdlc
depth: Comprehensive
keywords:
  - salesforce
  - salesforce dx
  - sfdx
  - apex
  - lightning web component
description: Full AI-DLC lifecycle specialized for Salesforce DX projects
skeleton: on
guard_policy: strict
sensors: on
learnings: on
summary_confirmation: on
runner: true
---

# Salesforce SDLC standard scope

Run the existing AI-DLC lifecycle end to end while applying Salesforce-specific
methodology and evidence requirements. The scope preserves the same 33-stage
coverage as `enterprise`; the plugin changes agent methodology and augments
selected stage instructions rather than replacing the graph.

## Safety posture

- Start with an explicitly allowed sandbox or scratch-org alias.
- Treat repository source and retrieved org metadata as evidence; do not invent
  metadata API names or assume the local project completely represents the org.
- Prefer standard functionality, configuration, and Flow before custom Apex or
  Lightning Web Components.
- Keep deployments, data changes, user changes, and destructive metadata behind
  the applicable AI-DLC approval gate.

## Membership

All 33 core stages execute. Initialization is always enabled by the framework;
this plugin contributes the scope to every core stage in Ideation, Inception,
Construction, and Operation.
