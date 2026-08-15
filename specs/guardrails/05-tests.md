# GR-05 — Tests
Required test classes are selected by feature risk:
unit, integration, API/contract, E2E/browser, security/abuse, concurrency/idempotency,
migration/data, accessibility, build/typecheck/lint, deployment/smoke.
- FAIL returns to implementation/debugging.
- Every critical bug gets a regression test.
- N/A requires justification.
- Never change expected behavior solely because implementation failed.
