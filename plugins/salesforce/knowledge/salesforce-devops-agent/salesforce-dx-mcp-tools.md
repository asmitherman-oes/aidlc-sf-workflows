# Salesforce DX MCP Tools — Operating Reference

The salesforce plugin's stages do org work through the **Salesforce DX MCP
server** (`@salesforce/mcp`). It wraps the Salesforce CLI's auth and APIs
behind MCP tools. When the server is not connected, use the `sf` CLI fallback
in the same row. Every result that informs an artifact is cited in that
artifact's `## Evidence` or report section.

## Setup (once per machine or project)

```bash
# Authorize orgs with the Salesforce CLI first (MCP reuses these auths):
sf org login web --alias dev-hub --set-default-dev-hub
sf org login web --alias my-sandbox --instance-url https://test.salesforce.com

# Register the MCP server with Claude Code (project scope writes .mcp.json):
claude mcp add salesforce-dx --scope project -- npx -y @salesforce/mcp --orgs DEFAULT_TARGET_ORG --toolsets all
```

- `--orgs` is an allowlist: `DEFAULT_TARGET_ORG`, `DEFAULT_TARGET_DEV_HUB`,
  `ALLOW_ALL_ORGS`, or explicit aliases or usernames. Keep production out of the
  allowlist unless a release stage needs it.
- `--toolsets` narrows the exposed tools (for example orgs, metadata, data,
  users, testing, code-analysis). Toolset names and non-GA tools vary by server
  version. Check the server's README; some tools need `--allow-non-ga-tools`.
- In Claude Code the tools appear as `mcp__<server-name>__<tool>`, for example
  `mcp__salesforce-dx__run_soql_query`. The server name is whatever was
  registered, so match on the tool suffix.

## Tools and CLI fallbacks

| MCP tool | Use it to | Write? | CLI fallback |
|----------|-----------|--------|--------------|
| `list_all_orgs` | List authorized orgs (alias, username, scratch or sandbox, Dev Hub) | read | `sf org list --json` |
| `get_username` | Resolve the default or a named target org or Dev Hub username | read | `sf org display --target-org <alias> --json` |
| `open_org` | Open an org (optionally a page) in the browser for the human | read | `sf org open --target-org <alias>` |
| `run_soql_query` | Run SOQL; set the Tooling API option for metadata entities | read | `sf data query --query "<soql>" [--use-tooling-api] --target-org <alias> --json` |
| `retrieve_metadata` | Retrieve source (by metadata or manifest) into the project | writes workspace | `sf project retrieve start --metadata <Type:Name> --target-org <alias>` |
| `deploy_metadata` | Deploy project source (dir, metadata, or manifest), optionally with a test level | **writes org** | `sf project deploy start --source-dir <dir> --test-level <lvl> --target-org <alias>` |
| `run_apex_test` | Run Apex tests (classes, suites, or a test level) with code coverage | runs in org | `sf apex run test --class-names <A,B> --code-coverage --result-format json --wait 30 --target-org <alias>` |
| `assign_permission_set` | Assign a permission set to a user | **writes org** | `sf org assign permset --name <PS> --target-org <alias> [--on-behalf-of <user>]` |
| `create_scratch_org` | Create a scratch org from a definition file | **creates org** | `sf org create scratch --definition-file config/project-scratch-def.json --alias <a> --duration-days 7 --target-dev-hub <hub>` |
| `create_org_snapshot` | Snapshot a configured scratch org for reuse | **creates** | `sf org create snapshot ...` |
| `delete_org` | Delete a scratch org | **irreversible** | `sf org delete scratch --target-org <alias> --no-prompt` |
| `resume_tool_operation` | Poll or resume a long-running deploy, retrieve, test, or org job by id | read | `sf project deploy report --job-id <id>` / `sf apex get test --test-run-id <id>` |
| `run_code_analyzer` (code-analysis toolset, when enabled) | Salesforce Code Analyzer (PMD, ESLint, RetireJS, Flow, regex) on paths | read | `sf code-analyzer run --workspace . --target <paths> --output-file results.json` |

Commands the MCP server does not cover:
- Validate-only deploy: `sf project deploy validate --manifest package.xml --test-level RunLocalTests --target-org <alias> --json`
- Quick deploy: `sf project deploy quick --job-id <validated-id> --target-org <alias>`
- Org limits: `sf org list limits --target-org <alias> --json`
- Manifest from source: `sf project generate manifest --source-dir force-app --output-dir manifest`

Follow each MCP tool's own input schema. Inputs typically include the target org
(alias or username) and the project `directory`. Pass the org explicitly rather
than relying on a default.

## Safety rules (all agents, all stages)

1. **Resolve and echo the target** (alias, username, and scratch, sandbox, or
   production) before any call marked write, creates, or irreversible.
2. **Production is read-only** except in Salesforce Release Deployment, and
   there only after a recorded human confirmation that names the org.
3. **Never delete** an org this workflow did not create. Ask before every
   `delete_org`.
4. **Retrieval overwrites local files.** Say which components and directory, and
   get consent, before `retrieve_metadata` into a dirty workspace.
5. **Long operations return a job id.** Poll with `resume_tool_operation` and
   record the final state, never the "in progress" state.
6. **Never paste credentials, access tokens, or session ids** into artifacts,
   logs, or prompts.

## Handy SOQL (Tooling API marked T)

```sql
SELECT Name, OrganizationType, IsSandbox, InstanceName, NamespacePrefix FROM Organization
SELECT Name, TotalLicenses, UsedLicenses FROM UserLicense WHERE Status = 'Active'
-- T: SELECT SubscriberPackage.Name, SubscriberPackageVersion.Name FROM InstalledSubscriberPackage
-- T: SELECT QualifiedApiName, DataType, IsIndexed FROM FieldDefinition WHERE EntityDefinition.QualifiedApiName = 'Account'
-- T: SELECT Name, TableEnumOrId, Status FROM ApexTrigger
SELECT ApiName, ProcessType, TriggerType, TriggerObjectOrEventLabel, IsActive FROM FlowDefinitionView
-- T: SELECT ValidationName, Active FROM ValidationRule WHERE EntityDefinition.QualifiedApiName = 'Account'
SELECT QualifiedApiName, InternalSharingModel, ExternalSharingModel FROM EntityDefinition WHERE QualifiedApiName IN ('Account')
SELECT Parent.Name, SobjectType, PermissionsRead, PermissionsEdit FROM ObjectPermissions WHERE SobjectType = 'Account'
SELECT Parent.Name, Field, PermissionsRead, PermissionsEdit FROM FieldPermissions WHERE SobjectType = 'Account'
-- T: SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate
```
