# Salesforce Testing Guide

## Platform rules

- Production deploys require **75% org-wide Apex coverage**, and every trigger
  must have some coverage. Test classes and `@IsTest` code do not count toward
  the total. All tests run in the deployment must pass.
- Treat 75% as the floor. The salesforce plugin defaults to **85% org-wide and
  75% per class**. Never lower a target to pass; surface the gap.
- Tests run in their own transaction with no access to org data unless
  `SeeAllData=true`, which is forbidden.

## Apex test structure

```apex
@IsTest
private class InvoiceServiceTest {
    @TestSetup
    static void setup() {
        TestDataFactory.createAccountsWithInvoices(1, 200);
    }

    @IsTest
    static void recalculatesTotalsInBulk() {
        List<Invoice__c> invoices = [SELECT Id FROM Invoice__c];
        Test.startTest();
        InvoiceService.recalculateTotals(new Map<Id, Invoice__c>(invoices).keySet());
        Test.stopTest();
        Assert.areEqual(200, [SELECT COUNT() FROM Invoice__c WHERE Total__c != null], 'All invoices recalculated');
    }

    @IsTest
    static void salesRepCannotEditPaidInvoice() {
        User rep = TestDataFactory.createUserWithPermissionSetGroup('Sales_Rep');
        System.runAs(rep) {
            // arrange, act, assert the DmlException or addError message
        }
    }
}
```

## Coverage of behaviour (each trigger or service path)

| Path | What to assert |
|------|----------------|
| Single record | The expected field values and related records |
| Bulk (200) | No limit exceptions; results correct for all records |
| Negative | Validation and `addError` messages, and exceptions with their message |
| Permission | `System.runAs` as each persona in the access matrix: can and cannot |
| Async | Wrap in `Test.startTest()`/`Test.stopTest()` so Queueable, Batch, and future work runs |
| Callouts | `Test.setMock(HttpCalloutMock.class, mock)` for success, error status, and timeout |

## Isolation tools

- `TestDataFactory` for every SObject: never inline record setup across tests.
- The Stub API (`Test.createStub`, `System.StubProvider`) or constructor
  injection to replace selectors and services.
- `Test.setMock` for HTTP and SOAP. `Test.getStandardPricebookId()` for
  pricebooks.
- `Test.setFixedSearchResults` for SOSL. `Test.setCreatedDate` for date logic.

## LWC Jest

One test file per component under `__tests__`. Cover rendering per state
(loading, data, error, empty), user events and dispatched `CustomEvent`s,
wire adapter emissions (`emit`, `error`), and imperative Apex mocks (resolved
and rejected). Clean the DOM in `afterEach`.

## Running and reading results

- MCP `run_apex_test` with code coverage, or
  `sf apex run test --test-level RunLocalTests --code-coverage --result-format json --wait 30`.
- Read `summary.outcome`, `testsRan`, `passing`, `failing`,
  `orgWideCoverage`, and per-class `coverage` (or query
  `ApexCodeCoverageAggregate` with the Tooling API).
- Write `salesforce-apex-test-results.json` exactly as Salesforce Org Validation
  specifies, so the coverage sensor can read it.

## UAT

Write UAT scripts per persona (permission set group) that trace to user stories
and acceptance criteria. Run them in a Partial or Full sandbox with realistic
data volumes.
