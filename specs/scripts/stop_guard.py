#!/usr/bin/env python3
import sys, json, os
from pathlib import Path
from datetime import datetime, timezone

raw = sys.stdin.read()
try:
    hook = json.loads(raw) if raw.strip() else {}
except Exception:
    sys.exit(0)

# Official guidance: prevent infinite stop-hook recursion.
if hook.get("stop_hook_active") is True:
    sys.exit(0)

project = Path(os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd()))
state_path = project / "specs" / "STATE.json"

if not state_path.exists():
    sys.exit(0)

try:
    state = json.loads(state_path.read_text(encoding="utf-8"))
except Exception:
    sys.exit(0)

status = str(state.get("status", "")).upper()
final_release = str(state.get("final_release", "")).upper()

# Genuine stop states
if status in {"COMPLETE", "WAITING_USER", "PAUSED", "BLOCKED"}:
    sys.exit(0)
if final_release == "PASS":
    sys.exit(0)

feature = state.get("current_feature", "unknown")
stage = state.get("current_stage", "unknown")

# Block one premature stop. Claude gets this as next instruction.
print(json.dumps({
    "decision": "block",
    "reason": (
        f"ProspectFlow workflow is incomplete. Continue from specs/STATE.json: "
        f"feature={feature}, stage={stage}. Read the matching stage guardrail. "
        "Do not skip tests/review/gate. If a real user decision or secret is required, "
        "set status WAITING_USER with an explicit reason instead of guessing."
    )
}, ensure_ascii=False))
