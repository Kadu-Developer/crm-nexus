# /speckit.tasks — Search Engine & Workers

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **job lifecycle, BullMQ/Redis, retries, idempotency, concurrency and cancellation**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 006-T01 — Modelar Search/SearchJob/SearchResult
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 004-provider-core, 005-google-maps-provider
- Aceite: tarefa concluída sem quebrar testes existentes.

### 006-T02 — Criar POST /searches
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 004-provider-core, 005-google-maps-provider
- Aceite: tarefa concluída sem quebrar testes existentes.

### 006-T03 — Configurar fila prospecting
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 004-provider-core, 005-google-maps-provider
- Aceite: tarefa concluída sem quebrar testes existentes.

### 006-T04 — Criar worker
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 004-provider-core, 005-google-maps-provider
- Aceite: tarefa concluída sem quebrar testes existentes.

### 006-T05 — Executar provider pelo registry
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 004-provider-core, 005-google-maps-provider
- Aceite: tarefa concluída sem quebrar testes existentes.

### 006-T06 — Persistir progresso
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 004-provider-core, 005-google-maps-provider
- Aceite: tarefa concluída sem quebrar testes existentes.

### 006-T07 — Implementar retry/backoff
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 004-provider-core, 005-google-maps-provider
- Aceite: tarefa concluída sem quebrar testes existentes.

### 006-T08 — Implementar cancelamento
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 004-provider-core, 005-google-maps-provider
- Aceite: tarefa concluída sem quebrar testes existentes.

### 006-T09 — Criar endpoint SSE
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 004-provider-core, 005-google-maps-provider
- Aceite: tarefa concluída sem quebrar testes existentes.

### 006-T10 — Criar testes com MockProvider
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 004-provider-core, 005-google-maps-provider
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] POST /searches não bloqueia a requisição
- [ ] Job é criado uma única vez
- [ ] Worker atualiza progresso
- [ ] Falhas temporárias são retentadas
- [ ] Busca pode ser cancelada com segurança

---
NEXT:
Execute: `004-implement.md`
