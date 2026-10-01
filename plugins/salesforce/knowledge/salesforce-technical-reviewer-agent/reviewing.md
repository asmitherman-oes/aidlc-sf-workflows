# Reviewing Salesforce Design Artifacts

Severity guide for findings. Cite the artifact line, requirement id, org
evidence, or platform limit for every one.

| Severity | Examples |
|----------|----------|
| **Blocker** (NOT-READY) | A synchronous path exceeds a governor limit at 200 records; two automations own one object event with no defined order; data exposed with no sharing or FLS decision; a design that cannot deploy (missing dependency, circular package dependency); a custom object duplicating a standard object with no rationale; production write steps without validation or rollback |
| **Major** | Non-selective query on an LDV object; ownership, account, or lookup skew not addressed; callout after DML in the same transaction; `without sharing` without justification; Flow logic that needs to be Apex (complex loops, callout retries); no External ID for integration upserts |
| **Minor** | Naming or description gaps; missing help text; a test strategy missing bulk or negative paths; a sourceApiVersion lag |

## Checklist by artifact

**Build Approach Matrix / Solution Blueprint.** Every requirement has an
approach and rationale. Standard features are considered first. Automation
Ownership names exactly one owner per object event. Governor Limit Hotspots
estimate the 200-record cost. Metadata maps to Units without shared-ownership
conflicts. The environment strategy has a production test level and a rollback
plan.

**Data Model / Data Dictionary.** Relationship types justify cascade and
sharing effects (master-detail inherits sharing). External IDs exist on
integration objects. LDV objects have indexed filter fields and an archival
plan. Every field has a type, a length, and a requirement trace.

**Security Model / Access Matrix.** OWD is the most restrictive that works.
Every elevation (`without sharing`, View All, Apex managed sharing) has a reason.
Every new field appears in the field access matrix. Experience Cloud and guest
access is minimal. Code enforcement rules name user-mode access.

## Verdict rule

READY means a Salesforce developer and admin could build, test, and deploy this
without returning to the architect, and nothing in it breaks at production
volume or under user permissions.
