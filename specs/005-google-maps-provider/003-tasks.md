# /speckit.tasks — Google Maps Prospecting

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **Places search, pagination, field mapping, quotas, retry/backoff and invalid responses**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 005-T01 — Criar package google-maps
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 004-provider-core
- Aceite: tarefa concluída sem quebrar testes existentes.

### 005-T02 — Criar config/credentials
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 004-provider-core
- Aceite: tarefa concluída sem quebrar testes existentes.

### 005-T03 — Implementar validate()
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 004-provider-core
- Aceite: tarefa concluída sem quebrar testes existentes.

### 005-T04 — Implementar estimate()
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 004-provider-core
- Aceite: tarefa concluída sem quebrar testes existentes.

### 005-T05 — Implementar search()
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 004-provider-core
- Aceite: tarefa concluída sem quebrar testes existentes.

### 005-T06 — Implementar normalize()
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 004-provider-core
- Aceite: tarefa concluída sem quebrar testes existentes.

### 005-T07 — Implementar healthCheck()
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 004-provider-core
- Aceite: tarefa concluída sem quebrar testes existentes.

### 005-T08 — Criar fixtures e testes
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 004-provider-core
- Aceite: tarefa concluída sem quebrar testes existentes.

### 005-T09 — Documentar limites do provider
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 004-provider-core
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Consulta real retorna leads normalizados
- [ ] Provider respeita limite solicitado
- [ ] Erros 429/timeout são classificados
- [ ] Dados incompletos não quebram o pipeline

---
NEXT:
Execute: `004-implement.md`
