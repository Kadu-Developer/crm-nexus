# /speckit.tasks — CRM & Kanban

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **pipeline/stages/cards, ordering, drag/drop, transitions and concurrency**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 010-T01 — Modelar Pipeline/Stage/Deal
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 007-lead-management, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 010-T02 — Criar pipeline padrão
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 007-lead-management, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 010-T03 — Criar POST /deals
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 010-T04 — Criar GET /pipeline
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 010-T05 — Criar PATCH /deals/:id/stage
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 010-T06 — Criar Kanban
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 010-T07 — Adicionar rollback de UI
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 010-T08 — Criar testes de transição
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Lead pode virar deal
- [ ] Workspace recebe pipeline padrão
- [ ] Movimento de card persiste no backend
- [ ] Mudanças são auditáveis
- [ ] Deal não vaza entre tenants

---
NEXT:
Execute: `004-implement.md`
