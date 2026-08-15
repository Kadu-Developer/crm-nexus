# /speckit.tasks — Import & Export

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **CSV/XLSX validation, mapping, limits, partial failures, export scope**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 016-T01 — Modelar Import/Export
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 008-deduplication, 014-plans-billing
- Aceite: tarefa concluída sem quebrar testes existentes.

### 016-T02 — Criar StorageProvider
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 008-deduplication, 014-plans-billing
- Aceite: tarefa concluída sem quebrar testes existentes.

### 016-T03 — Criar upload/preview
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 008-deduplication, 014-plans-billing
- Aceite: tarefa concluída sem quebrar testes existentes.

### 016-T04 — Criar mapeamento de colunas
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 008-deduplication, 014-plans-billing
- Aceite: tarefa concluída sem quebrar testes existentes.

### 016-T05 — Criar import worker
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 008-deduplication, 014-plans-billing
- Aceite: tarefa concluída sem quebrar testes existentes.

### 016-T06 — Criar export worker
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 008-deduplication, 014-plans-billing
- Aceite: tarefa concluída sem quebrar testes existentes.

### 016-T07 — Criar autorização
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 008-deduplication, 014-plans-billing
- Aceite: tarefa concluída sem quebrar testes existentes.

### 016-T08 — Criar UI
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 008-deduplication, 014-plans-billing
- Aceite: tarefa concluída sem quebrar testes existentes.

### 016-T09 — Adicionar testes
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 008-deduplication, 014-plans-billing
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Import usa deduplicação existente
- [ ] Export respeita RBAC e plano
- [ ] Arquivos grandes não bloqueiam request HTTP
- [ ] Download só é liberado ao workspace correto

---
NEXT:
Execute: `004-implement.md`
