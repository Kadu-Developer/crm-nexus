#!/usr/bin/env python3
import sys, os, json
from pathlib import Path
from datetime import datetime, timezone
raw = sys.stdin.read()
project = Path(os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd()))
log = project / "specs" / ".runtime" / "stop-failures.log"
log.parent.mkdir(parents=True, exist_ok=True)
try:
    payload = json.loads(raw) if raw.strip() else {}
except Exception:
    payload = {"raw": raw[:2000]}
entry = {"at": datetime.now(timezone.utc).isoformat(), "payload": payload}
with log.open("a", encoding="utf-8") as f:
    f.write(json.dumps(entry, ensure_ascii=False) + "\n")
