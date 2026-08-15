# /speckit.tasks — Credits & Usage

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **immutable credit ledger, debit/credit, reservations, idempotency and concurrency**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 013-T01 — Modelar CreditLedger
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 013-T02 — Criar balance service
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 013-T03 — Criar reserve()
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 013-T04 — Criar settle()
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 013-T05 — Criar release()
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 013-T06 — Criar refund()
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 013-T07 — Integrar criação de busca
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 013-T08 — Integrar conclusão/falha do worker
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 013-T09 — Criar testes de concorrência
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Saldo pode ser derivado do ledger
- [ ] Duas buscas concorrentes não gastam o mesmo saldo
- [ ] Falha libera reserva quando aplicável
- [ ] Ajuste administrativo não edita saldo diretamente

---
NEXT:
Execute: `004-implement.md`
