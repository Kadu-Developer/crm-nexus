# /speckit.tasks — Lead Deduplication

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **normalization, duplicate detection, merge policy, concurrent inserts**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 008-T01 — Modelar LeadIdentity
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 008-T02 — Criar normalizers
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 008-T03 — Definir precedência de identidade
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 008-T04 — Criar resolver
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 008-T05 — Criar deduplication service
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 008-T06 — Integrar ao worker
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 008-T07 — Criar testes concorrentes
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 008-T08 — Criar estratégia de merge
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Mesmo externalId não cria dois leads
- [ ] Mesmo telefone/email pode resolver para lead existente
- [ ] Fontes diferentes são preservadas
- [ ] Processamento concorrente não duplica registros

---
NEXT:
Execute: `004-implement.md`
