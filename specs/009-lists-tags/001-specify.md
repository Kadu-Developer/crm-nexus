# /speckit.specify — Lists & Tags

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**009 — Lists & Tags**

## Objetivo
Permitir organização operacional de leads através de listas e tags por workspace.

## Escopo
- List
- ListItem
- Tag
- LeadTag
- Bulk add/remove
- Filtros por lista/tag
- UI de listas

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
- Lead pode pertencer a várias listas
- Tag pertence ao workspace
- Bulk action respeita RBAC
- Remover da lista não remove o lead

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Lists & Tags**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
