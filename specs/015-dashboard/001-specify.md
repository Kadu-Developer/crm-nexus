# /speckit.specify — Dashboard & Metrics

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**015 — Dashboard & Metrics**

## Objetivo
Exibir métricas operacionais de prospecção, leads, pipeline e consumo em uma visão consolidada.

## Escopo
- Dashboard API agregada
- Cards principais
- Gráficos
- Leads por fonte
- Funil
- Créditos
- Período

## Dependências
- 007-lead-management
- 010-crm-kanban
- 013-credits

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- Dashboard não faz dezenas de requests desnecessárias
- Métricas respeitam workspace
- Período pode ser filtrado
- Valores batem com consultas de referência

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Dashboard & Metrics**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
