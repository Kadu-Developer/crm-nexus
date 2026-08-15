# /speckit.tasks — Production Deployment

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **production build, migrations, Docker/VPS, TLS, health, backup/restore and rollback**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 020-T01 — Criar Dockerfiles de produção
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 019-security-hardening, 017-admin-panel
- Aceite: tarefa concluída sem quebrar testes existentes.

### 020-T02 — Criar compose de produção
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 019-security-hardening, 017-admin-panel
- Aceite: tarefa concluída sem quebrar testes existentes.

### 020-T03 — Configurar reverse proxy
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 019-security-hardening, 017-admin-panel
- Aceite: tarefa concluída sem quebrar testes existentes.

### 020-T04 — Configurar TLS
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 019-security-hardening, 017-admin-panel
- Aceite: tarefa concluída sem quebrar testes existentes.

### 020-T05 — Criar migration step
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 019-security-hardening, 017-admin-panel
- Aceite: tarefa concluída sem quebrar testes existentes.

### 020-T06 — Criar backup job
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 019-security-hardening, 017-admin-panel
- Aceite: tarefa concluída sem quebrar testes existentes.

### 020-T07 — Documentar restore
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 019-security-hardening, 017-admin-panel
- Aceite: tarefa concluída sem quebrar testes existentes.

### 020-T08 — Criar pipeline CI/CD
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 019-security-hardening, 017-admin-panel
- Aceite: tarefa concluída sem quebrar testes existentes.

### 020-T09 — Criar runbook de incidentes
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 019-security-hardening, 017-admin-panel
- Aceite: tarefa concluída sem quebrar testes existentes.

### 020-T10 — Executar acceptance test
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 019-security-hardening, 017-admin-panel
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Deploy sobe web/api/worker
- [ ] HTTPS funciona
- [ ] Migrations rodam de forma controlada
- [ ] Backup automático existe
- [ ] Restore foi testado
- [ ] Health checks são monitoráveis

---
NEXT:
Execute: `004-implement.md`
