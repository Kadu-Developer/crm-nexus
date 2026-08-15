# /speckit.gate — Lists & Tags

## STAGE GUARDRAIL
Read `../guardrails/07-gate-next.md`.

## Hard gate
### Scope
- [ ] Acceptance criteria proven.
- [ ] All P0/P1 tasks complete.
- [ ] No unapproved scope expansion.

### Quality
- [ ] Applicable lint PASS.
- [ ] Applicable typecheck PASS.
- [ ] Build PASS.
- [ ] Required unit/integration/API tests PASS.
- [ ] Required E2E/browser tests PASS.
- [ ] Required security/concurrency tests PASS.
- [ ] Required migration/deployment tests PASS.

### Review and safety
- [ ] Adversarial review complete.
- [ ] Zero P0/P1.
- [ ] No new secret.
- [ ] Rollback exists where applicable.
- [ ] P2/P3 debt documented.

## State transition
If FAIL:
- set `status = "IN_PROGRESS"`;
- set `current_stage` to the stage that must be repeated;
- DO NOT execute NEXT.

If PASS:
- record this feature as complete;
- increment `completed_features`;
- update `last_completed_file`;
- set `last_progress_at` to current ISO timestamp;
- set `current_feature = "010-crm-kanban"`;
- set `current_stage = "001-specify.md"`;
- set `status = "IN_PROGRESS"`.

Set exactly one decision in this file during execution:
`STATUS: PASS` or `STATUS: FAIL`

---
NEXT:
Execute: `../010-crm-kanban/001-specify.md`
