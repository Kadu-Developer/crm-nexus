# /speckit.specify — Admin Panel

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**017 — Admin Panel**

## Objetivo
Criar painel exclusivo da plataforma para administração de workspaces, usuários, planos, créditos, providers e jobs.

## Escopo
- Platform admin
- Workspaces
- Users
- Credits
- Providers
- Jobs
- Plans
- Feature flags

## Dependências
- 014-plans-billing
- 013-credits
- 006-search-engine-workers

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- Admin de workspace não acessa platform admin
- Ajustes de crédito usam ledger
- Jobs podem ser inspecionados
- Provider pode ser ativado/desativado

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Admin Panel**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
