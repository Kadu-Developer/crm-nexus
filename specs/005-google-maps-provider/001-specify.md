# /speckit.specify — Google Maps Prospecting

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**005 — Google Maps Prospecting**

## Objetivo
Implementar o primeiro provider real para prospecção B2B local baseada em consultas e localização.

## Escopo
- Busca por query + localização
- Limite de resultados
- Normalização de empresa, telefone, site, endereço, rating e URL
- Tratamento de zero resultados
- Rate limit e timeout
- Health check

## Dependências
- 004-provider-core

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- Consulta real retorna leads normalizados
- Provider respeita limite solicitado
- Erros 429/timeout são classificados
- Dados incompletos não quebram o pipeline

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Google Maps Prospecting**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
