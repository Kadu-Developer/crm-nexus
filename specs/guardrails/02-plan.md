# GR-02 — Plan
MUST:
- Read spec and actual code.
- Resolve real file paths; do not invent repository structure.
- Map acceptance criteria to implementation and tests.
- Cover schema/migrations/auth/tenant/security/observability/rollback when applicable.
- Prefer minimal incremental changes and existing architecture.
MUST NOT:
- implement while planning;
- add infra/services without evidence;
- make destructive migration without backup/backfill/rollback.
PASS only when tasks can be generated without major unresolved architecture decisions.
