# /speckit.tasks — Lists & Tags

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **list/tag CRUD, associations, filters, bulk operations and tenant isolation**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 009-T01 — Modelar List/ListItem
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 009-T02 — Modelar Tag/LeadTag
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 009-T03 — Criar CRUD de listas
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 009-T04 — Criar CRUD de tags
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 009-T05 — Criar bulk add/remove
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 009-T06 — Integrar filtros
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 009-T07 — Criar páginas de listas
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 009-T08 — Criar testes tenant-aware
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Lead pode pertencer a várias listas
- [ ] Tag pertence ao workspace
- [ ] Bulk action respeita RBAC
- [ ] Remover da lista não remove o lead

---
NEXT:
Execute: `004-implement.md`
