# GR-06 — Adversarial Review
Review actual diff against spec.
Classify findings P0/P1/P2/P3.
Always challenge:
- auth/authz/tenant scope;
- validation and trust boundaries;
- race/idempotency;
- migration/data integrity;
- secrets/logging;
- performance/abuse;
- meaningfulness of tests;
- orthogonal changes.
P0/P1 BLOCK. P2/P3 may be deferred only in `../DEBT.md`.
