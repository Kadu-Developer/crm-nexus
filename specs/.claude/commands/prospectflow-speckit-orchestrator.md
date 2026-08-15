# ProspectFlow SpecKit Orchestrator — Claude Code CLI v3

Use this file as the primary entry point with:

`@specs\.claude\commands\prospectflow-speckit-orchestrator.md`

## Start
1. Read `specs/CLAUDE.md`.
2. Read `specs/STATE.json` and `specs/STATE.md`.
3. Read `specs/EXECUTION-ORDER.md`.
4. Read `specs/guardrails/08-continuity-watchdog.md`.
5. Load the local skills under `specs/.claude/skills/`.
6. On the first feature, run the `find-skills` procedure.
7. Continue exactly from the feature/stage in `STATE.json`.

## Mandatory per-feature order
`001-specify.md → 002-plan.md → 003-tasks.md → 004-implement.md → 005-tests.md → 006-review.md → 007-gate.md`

## Continuity loop
Schedule/activate the Claude Code bundled `/loop` at approximately 5 minutes with this objective:

“Read specs/STATE.json. If the ProspectFlow workflow is incomplete and state is not WAITING_USER, PAUSED or BLOCKED, continue from the exact current stage, respecting every guardrail. If productive work is already in progress, do not duplicate it. If a stage failed, follow its backward route rather than skipping.”

The loop is maintenance, not permission to bypass gates.

## Stop behavior
The session is started with `specs/.claude/settings.json`, which contains a Stop hook.
The Stop hook blocks one premature stop while work is still actionable.
If Claude then stops again, the external watchdog may resume the CLI.
Never fight a genuine WAITING_USER/PAUSED/BLOCKED state.

## Completion
Only `specs/FINAL-RELEASE-GATE.md` may set:
- status COMPLETE
- final_release PASS
