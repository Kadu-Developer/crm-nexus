# /speckit.specify — Tasks & Activities

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**011 — Tasks & Activities**

## Objetivo
Registrar contatos, notas e follow-ups associados a leads e oportunidades.

## Escopo
- Activity
- Task
- Notas
- Tipos de interação
- Atribuição
- Prioridade
- Due date
- Dashboard de follow-up

## Dependências
- 010-crm-kanban

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- Mudança de estágio gera atividade
- Usuário pode registrar ligação/WhatsApp/email/reunião
- Tarefas atrasadas são identificadas
- Tarefas podem ser concluídas

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Tasks & Activities**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
