# /speckit.review — Provider Core

## STAGE GUARDRAIL
Read `../guardrails/06-review.md`.
Use `../.claude/skills/adversarial-gate-review/SKILL.md` and any audited code-review skill available.

## Review inputs
- `001-specify.md`
- `002-plan.md`
- `003-tasks.md`
- actual git diff
- test evidence from `005-tests.md`

## Adversarial focus
**provider coupling, secret leakage, error normalization, unbounded external calls**

## Finding format
```text
ID:
Severity: P0 | P1 | P2 | P3
Type:
File/line:
Evidence:
Impact:
Required action:
```

## Routing
- P0/P1 → BLOCK → `004-implement.md` → `005-tests.md` → repeat this review.
- P2/P3 → resolve or record explicitly in `../DEBT.md`.

## REVIEW GATE
- [ ] Zero P0.
- [ ] Zero P1.
- [ ] No unresolved spec violation.
- [ ] Tests are meaningful, not implementation-confirming only.
- [ ] Deferred P2/P3 documented.

## STATE CONTRACT
On PASS, set `current_stage` to `007-gate.md`.

---
NEXT:
Execute: `007-gate.md`
