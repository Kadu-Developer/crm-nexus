# /speckit.tasks — Authentication

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **signup/login/logout/session/password/OAuth flows and auth failures**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 002-T01 — Modelar User e Session
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

### 002-T02 — Criar register
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

### 002-T03 — Criar login
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

### 002-T04 — Criar middleware de autenticação
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

### 002-T05 — Criar logout
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

### 002-T06 — Criar forgot-password
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

### 002-T07 — Criar reset-password
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

### 002-T08 — Adicionar validação e rate limit em auth
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

### 002-T09 — Adicionar testes unitários e integração
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Usuário consegue registrar e entrar
- [ ] Senha errada não autentica
- [ ] Sessão expirada é rejeitada
- [ ] Logout invalida a sessão
- [ ] Token de reset é de uso único

---
NEXT:
Execute: `004-implement.md`
