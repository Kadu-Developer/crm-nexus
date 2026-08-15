# SOURCE-AUDIT — ProspectFlow Spec Kit migration

## Source package
Original package contained:
- 20 feature directories;
- 4 stages per feature: specify, plan, tasks, implement;
- 80 feature files;
- execution order, release checklist and README.

## v3 migration
Preserved original feature scope/content, then added:
- mandatory skills discovery;
- stage-specific guardrails;
- 005-tests;
- 006-review;
- 007-gate;
- machine-readable state;
- Stop hook;
- native `/loop` continuity guidance;
- external CLI watchdog;
- final release gate.

## Core architecture encoded in source specs
ProspectFlow targets a multi-tenant prospecting SaaS with provider abstraction, Google Maps provider,
async search workers, lead management/dedup, CRM/Kanban, tasks, scoring, immutable credits,
plans/billing, dashboards, import/export, admin, observability, security and production deployment.

## Security principle
Authorized/legal providers only. No anti-bot bypass or unauthorized scraping is introduced by this migration.
