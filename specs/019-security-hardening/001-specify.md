# /speckit.specify — Security Hardening

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**019 — Security Hardening**

## Objetivo
Aplicar controles de segurança transversais antes do lançamento do SaaS.

## Escopo
- Rate limiting
- Security headers
- CSP
- Secrets encryption
- Input validation
- Idempotency
- CSRF quando aplicável
- Security tests

## Dependências
- 002-authentication
- 003-multi-tenancy-rbac
- 018-audit-observability

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- Nenhum endpoint público aceita payload sem validação
- Secrets não ficam em texto puro no banco
- Auth possui rate limit
- Operações críticas são idempotentes
- Headers de segurança estão presentes

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Security Hardening**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
