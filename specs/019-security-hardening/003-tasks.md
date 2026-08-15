# /speckit.tasks — Security Hardening

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **OWASP/API abuse, headers, rate limits, secrets, dependencies and permission boundaries**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 019-T01 — Auditar schemas Zod
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 002-authentication, 003-multi-tenancy-rbac, 018-audit-observability
- Aceite: tarefa concluída sem quebrar testes existentes.

### 019-T02 — Adicionar rate limit
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 002-authentication, 003-multi-tenancy-rbac, 018-audit-observability
- Aceite: tarefa concluída sem quebrar testes existentes.

### 019-T03 — Configurar security headers
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 002-authentication, 003-multi-tenancy-rbac, 018-audit-observability
- Aceite: tarefa concluída sem quebrar testes existentes.

### 019-T04 — Criar SecretsService
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 002-authentication, 003-multi-tenancy-rbac, 018-audit-observability
- Aceite: tarefa concluída sem quebrar testes existentes.

### 019-T05 — Criar IdempotencyService
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 002-authentication, 003-multi-tenancy-rbac, 018-audit-observability
- Aceite: tarefa concluída sem quebrar testes existentes.

### 019-T06 — Aplicar em search/billing/credits/export
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 002-authentication, 003-multi-tenancy-rbac, 018-audit-observability
- Aceite: tarefa concluída sem quebrar testes existentes.

### 019-T07 — Revisar cookies/CSRF
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 002-authentication, 003-multi-tenancy-rbac, 018-audit-observability
- Aceite: tarefa concluída sem quebrar testes existentes.

### 019-T08 — Criar security regression tests
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 002-authentication, 003-multi-tenancy-rbac, 018-audit-observability
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Nenhum endpoint público aceita payload sem validação
- [ ] Secrets não ficam em texto puro no banco
- [ ] Auth possui rate limit
- [ ] Operações críticas são idempotentes
- [ ] Headers de segurança estão presentes

---
NEXT:
Execute: `004-implement.md`
