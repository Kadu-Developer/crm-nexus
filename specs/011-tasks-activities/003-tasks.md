# /speckit.tasks — Tasks & Activities

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **tasks, reminders, activities, ownership, due dates and audit trail**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 011-T01 — Modelar Activity
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 010-crm-kanban
- Aceite: tarefa concluída sem quebrar testes existentes.

### 011-T02 — Modelar Task
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 010-crm-kanban
- Aceite: tarefa concluída sem quebrar testes existentes.

### 011-T03 — Criar CRUD de atividades
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 010-crm-kanban
- Aceite: tarefa concluída sem quebrar testes existentes.

### 011-T04 — Criar CRUD de tarefas
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 010-crm-kanban
- Aceite: tarefa concluída sem quebrar testes existentes.

### 011-T05 — Gerar atividade de stage change
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 010-crm-kanban
- Aceite: tarefa concluída sem quebrar testes existentes.

### 011-T06 — Criar filtros hoje/atrasadas/próximas
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 010-crm-kanban
- Aceite: tarefa concluída sem quebrar testes existentes.

### 011-T07 — Criar UI de follow-up
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 010-crm-kanban
- Aceite: tarefa concluída sem quebrar testes existentes.

### 011-T08 — Adicionar testes
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 010-crm-kanban
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Mudança de estágio gera atividade
- [ ] Usuário pode registrar ligação/WhatsApp/email/reunião
- [ ] Tarefas atrasadas são identificadas
- [ ] Tarefas podem ser concluídas

---
NEXT:
Execute: `004-implement.md`
