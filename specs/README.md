# ProspectFlow SpecKit — Claude CLI v3

## Structure
- 20 feature domains
- 7 staged files per feature = 140 feature-stage files
- Skills + guardrails + state + hooks + watchdog
- Final production release gate

## Stage order
`001-specify → 002-plan → 003-tasks → 004-implement → 005-tests → 006-review → 007-gate`

## First feature
`001-saas-foundation/001-specify.md`

Its first workflow requires `find-skills`.

## Initial command
From repository root:
```powershell
.\START-PROSPECTFLOW.ps1
```

Supervised auto-resume:
```powershell
.\WATCH-PROSPECTFLOW.ps1
```

Manual Claude entry:
```text
@specs\.claude\commands\prospectflow-speckit-orchestrator.md
```

See `MASTER-RUNBOOK.md`.
