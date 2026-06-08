# Partner Architecture Readiness Report

Date: 2026-06-08

## Existing Structures

- `partners` table references appear throughout operator code.
- `drivers.partner_id` is used for driver ownership.
- Operator RPCs for creating partners/drivers are present in the repository migration package.
- Dashboard can load partners and drivers under current operator constraints.

## Missing Future Structures

- Formal partner RBAC matrix.
- Partner-scoped financial model.
- Partner-specific pricing/vehicle configuration.
- Partner-level customer visibility rules.
- Partner payout and settlement workflow.

## Recommended Future RBAC Model

- Super Admin: all operations and configuration.
- Partner Admin: scoped partner operations, drivers, and assigned bookings.
- Dispatcher: dispatch and assignment within allowed scope.
- Driver: own assignments only.
- Customer: own bookings only.

## Status

Readiness audit only. No partner permissions implemented.
