# /speckit.specify — Audit & Observability

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**018 — Audit & Observability**

## Objetivo
Tornar ações críticas, requests, jobs e falhas rastreáveis em produção.

## Escopo
- AuditLog
- Structured logs
- Request ID
- Job logs
- Health checks
- Error tracking
- Metrics

## Dependências
- 001-saas-foundation

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- Toda ação crítica gera audit log
- Cada request possui requestId
- Jobs têm correlação com searchId
- Falhas podem ser rastreadas sem expor secrets

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Audit & Observability**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
