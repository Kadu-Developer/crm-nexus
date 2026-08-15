# GR-07 — Gate / NEXT
NEXT is allowed only when:
- acceptance criteria proven;
- P0/P1 tasks complete;
- applicable lint/typecheck/build/tests pass;
- review has zero P0/P1;
- no secret or unsafe suppression introduced;
- rollback exists for critical changes;
- STATE.json and STATE.md are updated.
A FAIL must route backward. Never convert a failure into a warning to advance.
