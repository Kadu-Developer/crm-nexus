# /speckit.tasks — Provider Core

## STAGE GUARDRAIL
Read `../guardrails/03-tasks.md`.

## TASK ENRICHMENT
Before implementation, every existing task below must be enriched with:
- real files/probable paths from `002-plan.md`;
- explicit verification/test;
- risk;
- dependency/parallelism.
Testing focus for this feature: **provider contracts, adapter errors, normalized results, quotas and provider switching**.

## STATE CONTRACT
On PASS, set `current_stage` to `004-implement.md`.


## Ordem de execução

### 004-T01 — Criar package providers/core
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 001-saas-foundation, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 004-T02 — Definir tipos RawLead/NormalizedLead/SearchInput
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 001-saas-foundation, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 004-T03 — Definir interface ProspectingProvider
- [ ] Implementar
- Prioridade: P0
- Dependências: Feature(s) 001-saas-foundation, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 004-T04 — Implementar registry
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 004-T05 — Criar Provider e ProviderConfiguration
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 004-T06 — Implementar status/capabilities
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 004-T07 — Criar MockProvider
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 004-T08 — Criar testes de contrato
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

### 004-T09 — Criar error mapper
- [ ] Implementar
- Prioridade: P1
- Dependências: Feature(s) 001-saas-foundation, 003-multi-tenancy-rbac
- Aceite: tarefa concluída sem quebrar testes existentes.

## Gate da feature
Antes de prosseguir, confirmar:
- [ ] MockProvider pode ser registrado e executado
- [ ] Provider desconhecido gera erro controlado
- [ ] Provider pode ser ativado/desativado sem mudar o core
- [ ] Erros externos são normalizados

---
NEXT:
Execute: `004-implement.md`
