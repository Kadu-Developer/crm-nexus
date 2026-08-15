# /speckit.tasks — SaaS Foundation

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **bootstrap, health, monorepo, database/Redis connectivity, build pipeline**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 001-T01 — Criar estrutura do monorepo
- [ ] Implementar
- Prioridade: P0
- Dependências: Nenhuma externa
- Aceite: tarefa concluída sem quebrar testes existentes.

### 001-T02 — Configurar workspaces e scripts raiz
- [ ] Implementar
- Prioridade: P0
- Dependências: Nenhuma externa
- Aceite: tarefa concluída sem quebrar testes existentes.

### 001-T03 — Criar apps/web
- [ ] Implementar
- Prioridade: P0
- Dependências: Nenhuma externa
- Aceite: tarefa concluída sem quebrar testes existentes.

### 001-T04 — Criar apps/api com /health
- [ ] Implementar
- Prioridade: P0
- Dependências: Nenhuma externa
- Aceite: tarefa concluída sem quebrar testes existentes.

### 001-T05 — Criar apps/worker
- [ ] Implementar
- Prioridade: P1
- Dependências: Nenhuma externa
- Aceite: tarefa concluída sem quebrar testes existentes.

### 001-T06 — Criar packages/config
- [ ] Implementar
- Prioridade: P1
- Dependências: Nenhuma externa
- Aceite: tarefa concluída sem quebrar testes existentes.

### 001-T07 — Criar packages/shared
- [ ] Implementar
- Prioridade: P1
- Dependências: Nenhuma externa
- Aceite: tarefa concluída sem quebrar testes existentes.

### 001-T08 — Adicionar PostgreSQL e Redis ao compose
- [ ] Implementar
- Prioridade: P1
- Dependências: Nenhuma externa
- Aceite: tarefa concluída sem quebrar testes existentes.

### 001-T09 — Configurar Prisma inicial
- [ ] Implementar
- Prioridade: P1
- Dependências: Nenhuma externa
- Aceite: tarefa concluída sem quebrar testes existentes.

### 001-T10 — Adicionar lint/typecheck/test/build
- [ ] Implementar
- Prioridade: P1
- Dependências: Nenhuma externa
- Aceite: tarefa concluída sem quebrar testes existentes.

### 001-T11 — Criar .env.example e validação de env
- [ ] Implementar
- Prioridade: P1
- Dependências: Nenhuma externa
- Aceite: tarefa concluída sem quebrar testes existentes.

### 001-T12 — Documentar bootstrap local
- [ ] Implementar
- Prioridade: P1
- Dependências: Nenhuma externa
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Ambiente sobe com um único comando
- [ ] Web, API e Worker iniciam sem erro
- [ ] PostgreSQL e Redis ficam acessíveis
- [ ] Build e typecheck passam
- [ ] /health retorna 200

---
NEXT:
Execute: `004-implement.md`
