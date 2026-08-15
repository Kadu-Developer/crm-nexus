# /speckit.specify — Credits & Usage

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**013 — Credits & Usage**

## Objetivo
Controlar consumo de prospecção por ledger transacional, incluindo reserva, uso, liberação e ajustes.

## Escopo
- CreditLedger
- Balance service
- Reservation
- Usage settlement
- Release
- Refund
- Admin adjustment
- Concorrência

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
- Saldo pode ser derivado do ledger
- Duas buscas concorrentes não gastam o mesmo saldo
- Falha libera reserva quando aplicável
- Ajuste administrativo não edita saldo diretamente

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Credits & Usage**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
