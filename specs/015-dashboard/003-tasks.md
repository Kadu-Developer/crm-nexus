# /speckit.tasks — Dashboard & Metrics

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **aggregations, filters, tenant scope, date ranges and empty/error states**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 015-T01 — Definir métricas
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 007-lead-management, 010-crm-kanban, 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

### 015-T02 — Criar GET /dashboard
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 007-lead-management, 010-crm-kanban, 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

### 015-T03 — Criar queries agregadas
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management, 010-crm-kanban, 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

### 015-T04 — Adicionar filtro de período
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management, 010-crm-kanban, 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

### 015-T05 — Criar cards
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management, 010-crm-kanban, 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

### 015-T06 — Criar gráficos
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management, 010-crm-kanban, 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

### 015-T07 — Testar consistência das métricas
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management, 010-crm-kanban, 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Dashboard não faz dezenas de requests desnecessárias
- [ ] Métricas respeitam workspace
- [ ] Período pode ser filtrado
- [ ] Valores batem com consultas de referência

---
NEXT:
Execute: `004-implement.md`
