# /speckit.tasks — Lead Scoring

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **deterministic scoring, weights, thresholds, versioning and regression vectors**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 012-T01 — Definir regras iniciais
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 012-T02 — Criar LeadScoringService
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 012-T03 — Persistir score
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 012-T04 — Integrar ao pipeline
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 012-T05 — Criar recálculo
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 012-T06 — Criar testes por regra
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

### 012-T07 — Exibir score na tabela/drawer
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 007-lead-management
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Score nunca passa de 100
- [ ] Lead incompleto ainda recebe score válido
- [ ] Recalculation ocorre após alteração relevante
- [ ] Regras são testáveis

---
NEXT:
Execute: `004-implement.md`
