# FINAL RELEASE GATE — ProspectFlow

Read `guardrails/07-gate-next.md` and `guardrails/08-continuity-watchdog.md`.

## Mandatory
- [ ] All 20 feature `007-gate.md` files reached PASS.
- [ ] Full lint/typecheck/build PASS.
- [ ] Full unit/integration/API suite PASS.
- [ ] Critical E2E/browser journeys PASS.
- [ ] Multi-tenant/RBAC security suite PASS.
- [ ] Provider/worker/idempotency tests PASS.
- [ ] Credits/billing replay/concurrency tests PASS.
- [ ] Import/export security tests PASS.
- [ ] PostgreSQL/Redis migration/state tests PASS.
- [ ] Production Docker/VPS smoke PASS.
- [ ] Backup AND restore rehearsal PASS.
- [ ] TLS/health/observability verified.
- [ ] Zero P0/P1 debt.
- [ ] Rollback runbook reviewed.

## Final adversarial scenarios
Prove behavior for:
- malicious provider/API payload;
- cross-tenant access;
- duplicate worker delivery;
- duplicate credit debit;
- replayed billing webhook;
- malicious CSV/import;
- interrupted migration;
- container recreation;
- backup restore;
- public/API abuse.

## Completion state
Only after every mandatory item passes:
- `status = "COMPLETE"`
- `final_release = "PASS"`
- `current_stage = "DONE"`
- update `last_progress_at`

Set:
`RELEASE_STATUS: PASS`

Otherwise:
`RELEASE_STATUS: FAIL`
and preserve the exact failing stage in state.
