# /speckit.specify — CRM & Kanban

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**010 — CRM & Kanban**

## Objetivo
Transformar leads em oportunidades e acompanhar o avanço pelo pipeline comercial.

## Escopo
- Pipeline
- PipelineStage
- Deal
- Pipeline default
- Kanban drag-and-drop
- Mudança de estágio
- Ganho/perdido

## Dependências
- 007-lead-management
- 003-multi-tenancy-rbac

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- Lead pode virar deal
- Workspace recebe pipeline padrão
- Movimento de card persiste no backend
- Mudanças são auditáveis
- Deal não vaza entre tenants

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **CRM & Kanban**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
