# /speckit.specify — Lead Management

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**007 — Lead Management**

## Objetivo
Persistir, consultar, atualizar e visualizar leads com paginação, filtros e histórico de origem.

## Escopo
- Lead
- LeadSource
- Listagem
- Detalhe
- Atualização
- Filtros server-side
- Cursor pagination
- Lead drawer

## Dependências
- 006-search-engine-workers
- 003-multi-tenancy-rbac

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- Leads são sempre tenant-scoped
- Listagem suporta filtros e cursor
- Detalhe retorna fontes
- Atualização respeita RBAC
- UI não carrega milhares de registros de uma vez

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Lead Management**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
