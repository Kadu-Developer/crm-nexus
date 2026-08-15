---
name: prospectflow-speckit-orchestrator
description: Run the complete ProspectFlow Spec Kit sequentially with skills, guardrails, tests, review, gates and resumable state.
---

# Entry
Read:
- `specs/STATE.json`
- `specs/STATE.md`
- `specs/EXECUTION-ORDER.md`
- `specs/guardrails/08-continuity-watchdog.md`

# Mandatory stage order per feature
`001-specify.md → 002-plan.md → 003-tasks.md → 004-implement.md → 005-tests.md → 006-review.md → 007-gate.md`

# First feature
Run the `find-skills` procedure before implementation.

# Continuity
At the start of the interactive session, use the bundled Claude `/loop` capability at a 5-minute cadence with this maintenance objective:
“Read specs/STATE.json. If workflow is incomplete and not PAUSED/WAITING_USER/BLOCKED, continue exactly from its current feature/stage, respecting all guardrails. If Claude is already making progress, do not duplicate work.”

# Failure routing
- test fail → debugging → implementation → full required tests;
- P0/P1 review → implementation → tests → review;
- gate fail → never NEXT;
- user/secret/irreversible decision needed → set `WAITING_USER`, explain exactly what is needed and allow stop.

# State
Update both `specs/STATE.json` and `specs/STATE.md` after each completed stage.
Only `007-gate.md` may advance to the next feature.
