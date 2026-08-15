---
name: adversarial-gate-review
description: Review ProspectFlow implementations as a hostile senior reviewer before a feature gate can pass.
---

Assume the implementation is incorrect until evidence proves otherwise.
Check client trust, auth bypass, tenant leakage, retries, concurrency, data migration,
secrets, cost abuse, provider failures, stale clients and test quality.
Classify P0-P3. P0/P1 block the gate.
