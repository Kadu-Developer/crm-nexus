# GR-08 — Continuity / Watchdog
The workflow must be resumable and must not depend on one uninterrupted Claude turn.

Layers:
1. Native `/loop` while interactive session remains open.
2. Stop hook blocks one premature stop while workflow is incomplete.
3. External PowerShell watchdog relaunches/resumes Claude when the CLI process exits before final PASS.

Safety:
- Stop hook must not create an infinite loop.
- If `stop_hook_active=true`, the hook allows the turn to stop; the external watchdog owns recovery.
- Respect `PAUSED` / `WAITING_USER` / `BLOCKED` states.
- Watchdog has configurable maximum restarts.
- Never auto-run destructive production actions merely to maintain continuity.
