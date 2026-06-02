# FleetConnect Phase 5 Rollback Plan

Date: 2026-06-02

Status: PREPARED - do not execute without explicit approval

## Scope

This rollback plan covers Phase 5 remediation changes only.

Pre-change snapshot:

- `outputs/phase5_prechange_snapshot_sanitized.json`

Secrets:

- No credential values are included in this plan.

## Approval Boundary

Rollback may require destructive schema operations such as dropping policies, functions, columns, or tables that were created during Phase 5.

Do not execute rollback SQL without a separate explicit approval message.

## Rollback Strategy

Rollback should be performed in reverse order:

1. Stop using any newly created RPCs from frontend code.
2. Restore the previous application file version from workspace history or backup if needed.
3. Drop newly created RLS policies and RPC functions.
4. Restore previous broad policies only if emergency access continuity is required and approved.
5. Disable newly enabled RLS only if explicitly approved.
6. Drop newly added payment tables only if explicitly approved and no production payment data exists.
7. Drop newly added columns only if explicitly approved and no production data depends on them.

## Candidate Rollback SQL

The following is intentionally not executed.

```sql
begin;

-- Remove Phase 5 RPCs.
drop function if exists public.create_public_booking(jsonb);
drop function if exists public.operator_update_booking_status(text, text);
drop function if exists public.operator_assign_driver(text, uuid);
drop function if exists public.driver_accept_assignment(text);
drop function if exists public.driver_decline_assignment(text);
drop function if exists public.sync_booking_user_id();

-- Remove Phase 5 policies.
drop policy if exists "Service role full access bookings" on public.bookings;
drop policy if exists "Authenticated customers view own bookings" on public.bookings;
drop policy if exists "Authenticated customers insert own bookings" on public.bookings;
drop policy if exists "Authenticated customers update own bookings" on public.bookings;
drop policy if exists "Anon can create bookings only" on public.bookings;
drop policy if exists "Service role full access customers" on public.customers;
drop policy if exists "Authenticated customers view own profile" on public.customers;
drop policy if exists "Authenticated customers update own profile" on public.customers;
drop policy if exists "Service role full access drivers" on public.drivers;
drop policy if exists "Authenticated users view drivers" on public.drivers;
drop policy if exists "Service role full access partners" on public.partners;
drop policy if exists "Authenticated users view partners" on public.partners;
drop policy if exists "Authenticated partner users view own partner" on public.partners;
drop policy if exists "Service role full access payments" on public.payments;
drop policy if exists "Users can view own payments" on public.payments;
drop policy if exists "Service role full access refunds" on public.refunds;
drop policy if exists "Users can view own refunds" on public.refunds;
drop policy if exists "Service role full access invoices" on public.invoices;
drop policy if exists "Users can view own invoices" on public.invoices;
drop policy if exists "Service role full access settlements" on public.settlements;
drop policy if exists "Service role full access ledger" on public.transaction_ledger;

-- Destructive cleanup candidates, approval required.
-- alter table public.bookings drop column if exists user_id;
-- alter table public.bookings drop column if exists metadata;
-- alter table public.customers drop column if exists user_id;
-- drop table if exists public.transaction_ledger;
-- drop table if exists public.settlements;
-- drop table if exists public.invoices;
-- drop table if exists public.refunds;
-- drop table if exists public.payments;

rollback;
```

## Validation After Rollback

After any approved rollback:

- Re-run live schema inventory.
- Re-run RLS inventory.
- Re-run anon REST read checks.
- Re-run Edge Function inventory.
- Compare against `phase5_prechange_snapshot_sanitized.json`.

## Current Rollback Status

No rollback has been executed.
