# /speckit.tests — Production Deployment

## STAGE GUARDRAIL
Read `../guardrails/05-tests.md`.

## Test focus
**production build, migrations, Docker/VPS, TLS, health, backup/restore and rollback**

## Mandatory matrix
Claude must mark PASS / FAIL / N/A **with evidence**.

| Class | Status | Command/artifact/evidence |
|---|---|---|
| Unit | NOT RUN | |
| Integration | NOT RUN | |
| API/contract | NOT RUN | |
| E2E/browser | NOT RUN | |
| Security/abuse | NOT RUN | |
| Concurrency/idempotency | NOT RUN | |
| Migration/data | NOT RUN | |
| Accessibility | NOT RUN | |
| Lint/typecheck/build | NOT RUN | |
| Production-like smoke | NOT RUN | |

## Acceptance mapping
For every acceptance criterion in `001-specify.md`, record the exact test or inspection proving it.

## Failure routing
Any applicable FAIL:
1. set state to this feature / `004-implement.md`;
2. reproduce and diagnose root cause;
3. fix;
4. add regression test;
5. rerun the full applicable matrix.

## STATE CONTRACT
On PASS, update `current_stage` to `006-review.md` and `last_progress_at`.

---
NEXT:
Execute: `006-review.md`
