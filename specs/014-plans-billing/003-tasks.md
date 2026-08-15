# /speckit.tasks — Plans & Billing

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **plan entitlements, subscriptions, checkout/webhooks, upgrades/downgrades**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 014-T01 — Modelar Plan/Subscription
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

### 014-T02 — Criar seed FREE/STARTER/PRO/AGENCY
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

### 014-T03 — Criar entitlement service
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

### 014-T04 — Definir BillingProvider
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

### 014-T05 — Implementar primeiro gateway
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

### 014-T06 — Criar checkout
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

### 014-T07 — Criar webhook handler
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

### 014-T08 — Adicionar idempotência
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

### 014-T09 — Criar testes
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 013-credits
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] Plano limita recursos no backend
- [ ] Webhook repetido não duplica efeitos
- [ ] Gateway pode ser trocado
- [ ] Assinatura atualiza entitlements

---
NEXT:
Execute: `004-implement.md`
