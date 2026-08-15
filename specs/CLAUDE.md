# CLAUDE.md — ProspectFlow SpecKit v3

## Source of truth
- `STATE.json` is machine state.
- `STATE.md` is human-readable mirror.
- `EXECUTION-ORDER.md` defines order.
- stage guardrails define hard constraints.

## Order per feature
`001-specify → 002-plan → 003-tasks → 004-implement → 005-tests → 006-review → 007-gate`

## First action
Feature 001 executes `find-skills`.

## Continuity
Use the native Claude Code `/loop` for periodic maintenance while the session is open.
A Stop hook and external watchdog provide additional recovery.
Never use continuity mechanisms to bypass WAITING_USER, BLOCKED, security, test or release gates.

## Implementation rules
- No unauthorized scraping or anti-bot bypass.
- Strict multi-tenant isolation.
- Server-side authz.
- Immutable ledger semantics for credits.
- Idempotent workers/webhooks.
- No secrets in repo/logs.
- No destructive migration without rollback.
- Do not weaken tests to get PASS.

## Resume rule
At session start/resume: read `STATE.json` and continue exactly from `current_feature/current_stage`.
