---
name: continuity-watchdog
description: Maintain and resume a long ProspectFlow Claude Code workflow without skipping safety gates.
---

Read `specs/guardrails/08-continuity-watchdog.md` and `specs/STATE.json`.
If incomplete and actionable, resume the exact stage.
If WAITING_USER/PAUSED/BLOCKED, do not force continuation.
Never restart a completed stage solely to create activity.
