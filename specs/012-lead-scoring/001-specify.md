# /speckit.specify — Lead Scoring

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**012 — Lead Scoring**

## Objetivo
Calcular score de 0 a 100 para priorização comercial usando regras configuráveis.

## Escopo
- LeadScoringService
- Regras padrão
- Score 0-100
- Recalculation
- Preparação para ICP futuro

## Dependências
- 007-lead-management

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- Score nunca passa de 100
- Lead incompleto ainda recebe score válido
- Recalculation ocorre após alteração relevante
- Regras são testáveis

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Lead Scoring**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
