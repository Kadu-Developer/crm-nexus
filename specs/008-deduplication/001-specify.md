# /speckit.specify — Lead Deduplication

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**008 — Lead Deduplication**

## Objetivo
Evitar registros duplicados e preservar múltiplas origens para a mesma entidade comercial.

## Escopo
- LeadIdentity
- Normalização de email/telefone/domain/CNPJ/URLs
- Identity resolution
- Merge seguro
- Preservação de LeadSource
- Concorrência

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
- Mesmo externalId não cria dois leads
- Mesmo telefone/email pode resolver para lead existente
- Fontes diferentes são preservadas
- Processamento concorrente não duplica registros

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Lead Deduplication**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
