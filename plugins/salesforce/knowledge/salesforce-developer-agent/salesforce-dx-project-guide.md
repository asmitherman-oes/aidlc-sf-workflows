# Salesforce DX Project Guide

## Layout

```text
sfdx-project.json            # packageDirectories, sourceApiVersion, namespace, packageAliases
.forceignore                 # files never deployed (e.g. **/jsconfig.json, **/__tests__/**)
config/project-scratch-def.json
manifest/package.xml         # optional, for manifest-based deploys
force-app/main/default/      # default package directory (one per package or Unit)
  classes/  triggers/  lwc/  aura/  objects/  flows/  permissionsets/
  permissionsetgroups/  layouts/  flexipages/  tabs/  applications/
  customMetadata/  labels/  namedCredentials/  externalCredentials/  staticresources/
scripts/apex/  scripts/soql/  data/
```

`sfdx-project.json` example:

```json
{
  "packageDirectories": [
    { "path": "force-app", "default": true },
    { "path": "sales-core", "package": "SalesCore", "versionNumber": "1.0.0.NEXT" }
  ],
  "namespace": "",
  "sfdcLoginUrl": "https://login.salesforce.com",
  "sourceApiVersion": "<current GA API version, e.g. 64.0>"
}
```

## Source-format metadata essentials

- **Custom object**: `objects/Invoice__c/Invoice__c.object-meta.xml`, with
  fields under `objects/Invoice__c/fields/Amount__c.field-meta.xml`, and record
  types, validation rules, and list views in sibling folders.
- **Field on a standard object**: `objects/Account/fields/Tier__c.field-meta.xml`.
- **Permission set**: grants object, field, Apex class, tab, and custom
  permission access. A new field is invisible to everyone until a permission
  set grants it, so generate the permission set changes with the field.
- **Flow**: `flows/Name.flow-meta.xml`; the status (`Active`/`Draft`) is in the
  file.
- **Custom Metadata record**: `customMetadata/Type.Record.md-meta.xml`.
- Every Apex class, trigger, and LWC carries a `-meta.xml` with `apiVersion`.

## Naming

- API names in PascalCase with `__c` (custom), `__e` (platform event), `__mdt`
  (custom metadata), and `__x` (external). No abbreviations users won't recognise.
- Every custom field and object has a description; user-facing fields have help
  text.

## Local tooling

- `npm install` for `@salesforce/sfdx-lwc-jest`, `eslint` +
  `@salesforce/eslint-config-lwc`, and `prettier` + `prettier-plugin-apex`.
- `sf project deploy start --dry-run` checks compile and deploy without saving.
- Salesforce Code Analyzer: `sf plugins install code-analyzer`, then
  `sf code-analyzer run`.
