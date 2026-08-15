# /speckit.tasks — Audit & Observability

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **structured logs, audit events, metrics, traces, redaction and alerts**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 018-T01 — Modelar AuditLog
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

### 018-T02 — Criar audit service
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

### 018-T03 — Instrumentar auth/billing/credits/admin/export
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

### 018-T04 — Criar request logger
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

### 018-T05 — Criar job logger
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

### 018-T06 — Criar health endpoints
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

### 018-T07 — Integrar error tracking
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

### 018-T08 — Criar painel/status básico
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Toda ação crítica gera audit log
- [ ] Cada request possui requestId
- [ ] Jobs têm correlação com searchId
- [ ] Falhas podem ser rastreadas sem expor secrets

---
NEXT:
Execute: `004-implement.md`
