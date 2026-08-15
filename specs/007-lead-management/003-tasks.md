# /speckit.tasks — Lead Management

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **lead CRUD, filtering, ownership, pagination, validation and tenant scope**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 007-T01 — Modelar Lead e LeadSource
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 007-T02 — Criar GET /leads
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 007-T03 — Criar GET /leads/:id
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 007-T04 — Criar PATCH /leads/:id
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 007-T05 — Adicionar filtros
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 007-T06 — Adicionar cursor pagination
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 007-T07 — Criar tabela
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 007-T08 — Criar lead drawer
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 007-T09 — Adicionar testes de autorização
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 006-search-engine-workers, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Leads são sempre tenant-scoped
- [ ] Listagem suporta filtros e cursor
- [ ] Detalhe retorna fontes
- [ ] Atualização respeita RBAC
- [ ] UI não carrega milhares de registros de uma vez

---
NEXT:
Execute: `004-implement.md`
