# MASTER RUNBOOK — ProspectFlow

## Recommended command
From repository root on Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\START-PROSPECTFLOW.ps1
```

For supervised auto-resume when the CLI exits:

```powershell
powershell -ExecutionPolicy Bypass -File .\WATCH-PROSPECTFLOW.ps1
```

## Inside Claude Code
The start script provides the initial prompt automatically.
If starting manually:

```text
@specs\.claude\commands\prospectflow-speckit-orchestrator.md
```

Then activate/check the native loop:

```text
/loop 5m Read specs/STATE.json. If the workflow is incomplete and actionable, continue from the exact current feature/stage with all guardrails. Do not duplicate active work and do not bypass WAITING_USER/PAUSED/BLOCKED.
```

## Verify hooks
Inside Claude:
```text
/hooks
/status
```

## State recovery
If a session stops, never restart at feature 001 blindly.
Resume using `STATE.json`.
