# EXECUTION-ORDER — ProspectFlow Claude CLI v3

## Stage order
`001-specify → 002-plan → 003-tasks → 004-implement → 005-tests → 006-review → 007-gate`

## Features
1. `001-saas-foundation/001-specify.md` — SaaS Foundation
2. `002-authentication/001-specify.md` — Authentication
3. `003-multi-tenancy-rbac/001-specify.md` — Multi-Tenancy & RBAC
4. `004-provider-core/001-specify.md` — Provider Core
5. `005-google-maps-provider/001-specify.md` — Google Maps Prospecting
6. `006-search-engine-workers/001-specify.md` — Search Engine & Workers
7. `007-lead-management/001-specify.md` — Lead Management
8. `008-deduplication/001-specify.md` — Lead Deduplication
9. `009-lists-tags/001-specify.md` — Lists & Tags
10. `010-crm-kanban/001-specify.md` — CRM & Kanban
11. `011-tasks-activities/001-specify.md` — Tasks & Activities
12. `012-lead-scoring/001-specify.md` — Lead Scoring
13. `013-credits/001-specify.md` — Credits & Usage
14. `014-plans-billing/001-specify.md` — Plans & Billing
15. `015-dashboard/001-specify.md` — Dashboard & Metrics
16. `016-import-export/001-specify.md` — Import & Export
17. `017-admin-panel/001-specify.md` — Admin Panel
18. `018-audit-observability/001-specify.md` — Audit & Observability
19. `019-security-hardening/001-specify.md` — Security Hardening
20. `020-production-deployment/001-specify.md` — Production Deployment

After feature 020:
- `FINAL-RELEASE-GATE.md`

## Failure routes
- tests FAIL → implement/debug → tests
- review P0/P1 → implement → tests → review
- gate FAIL → appropriate prior stage
- WAITING_USER/PAUSED/BLOCKED → do not force continuation

## Continuity
- interactive session: native `/loop` maintenance
- Stop hook: one forced continuation when actionable
- CLI process exit: external `WATCH-PROSPECTFLOW.ps1` may resume