# /speckit.tasks — Multi-Tenancy & RBAC

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **workspace isolation, membership roles, authorization matrix, cross-tenant access**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 003-T01 — Modelar Workspace e WorkspaceMember
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 002-authentication
- Aceite: tarefa concluída sem quebrar testes existentes.

### 003-T02 — Criar workspace no onboarding
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 002-authentication
- Aceite: tarefa concluída sem quebrar testes existentes.

### 003-T03 — Criar seletor/contexto de workspace
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 002-authentication
- Aceite: tarefa concluída sem quebrar testes existentes.

### 003-T04 — Criar permission matrix
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 002-authentication
- Aceite: tarefa concluída sem quebrar testes existentes.

### 003-T05 — Criar can() central
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 002-authentication
- Aceite: tarefa concluída sem quebrar testes existentes.

### 003-T06 — Aplicar guards na API
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 002-authentication
- Aceite: tarefa concluída sem quebrar testes existentes.

### 003-T07 — Criar testes cross-tenant
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 002-authentication
- Aceite: tarefa concluída sem quebrar testes existentes.

### 003-T08 — Criar testes de roles
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 002-authentication
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Usuário A não acessa recurso do workspace B
- [ ] Recursos tenant-owned sempre filtram por workspaceId
- [ ] Permissões são avaliadas no backend
- [ ] Acesso indevido retorna 404 quando apropriado

---
NEXT:
Execute: `004-implement.md`
