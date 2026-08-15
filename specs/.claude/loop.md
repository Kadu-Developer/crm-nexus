Read `specs/STATE.json`.
If ProspectFlow is incomplete and status is actionable, continue exactly from current_feature/current_stage.
Respect the matching stage guardrail and all tests/review/gates.
If already making progress, do not duplicate work.
If WAITING_USER/PAUSED/BLOCKED/COMPLETE, take no continuation action.
