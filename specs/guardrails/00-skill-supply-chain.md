# GR-00 — Skill Supply Chain

Before using/installing a third-party skill:
1. Run the `find-skills` procedure.
2. Inspect its `SKILL.md`, source/repository and scripts.
3. Record source/version/permissions/network/secrets in `SKILLS-AUDIT.md`.
4. Never execute opaque `curl | sh` / remote scripts.
5. Never expose production credentials just to satisfy a skill.
6. Prefer already-audited skills.
7. If the required capability is unavailable, record it and use built-in Claude tools safely.

BLOCK if source or requested privileges cannot be understood.
