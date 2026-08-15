# /speckit.tasks — Admin Panel

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **admin auth, platform metrics, tenant/user actions and dangerous operations**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 017-T01 — Criar platform admin model/flag
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 014-plans-billing, 013-credits, 006-search-engine-workers
- Aceite: tarefa concluída sem quebrar testes existentes.

### 017-T02 — Criar guard /admin
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 014-plans-billing, 013-credits, 006-search-engine-workers
- Aceite: tarefa concluída sem quebrar testes existentes.

### 017-T03 — Criar workspaces page
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 014-plans-billing, 013-credits, 006-search-engine-workers
- Aceite: tarefa concluída sem quebrar testes existentes.

### 017-T04 — Criar users page
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 014-plans-billing, 013-credits, 006-search-engine-workers
- Aceite: tarefa concluída sem quebrar testes existentes.

### 017-T05 — Criar credits adjustment
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 014-plans-billing, 013-credits, 006-search-engine-workers
- Aceite: tarefa concluída sem quebrar testes existentes.

### 017-T06 — Criar providers page
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 014-plans-billing, 013-credits, 006-search-engine-workers
- Aceite: tarefa concluída sem quebrar testes existentes.

### 017-T07 — Criar jobs monitor
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 014-plans-billing, 013-credits, 006-search-engine-workers
- Aceite: tarefa concluída sem quebrar testes existentes.

### 017-T08 — Criar plans page
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 014-plans-billing, 013-credits, 006-search-engine-workers
- Aceite: tarefa concluída sem quebrar testes existentes.

### 017-T09 — Adicionar testes de acesso
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 014-plans-billing, 013-credits, 006-search-engine-workers
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Admin de workspace não acessa platform admin
- [ ] Ajustes de crédito usam ledger
- [ ] Jobs podem ser inspecionados
- [ ] Provider pode ser ativado/desativado

---
NEXT:
Execute: `004-implement.md`
