# /speckit.specify — Plans & Billing

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**014 — Plans & Billing**

## Objetivo
Adicionar planos, assinaturas, limites e integração desacoplada com gateway de pagamento.

## Escopo
- Plan
- Subscription
- Entitlements
- BillingProvider
- Checkout
- Upgrade/downgrade
- Webhooks idempotentes

## Dependências
- 013-credits

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- Plano limita recursos no backend
- Webhook repetido não duplica efeitos
- Gateway pode ser trocado
- Assinatura atualiza entitlements

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Plans & Billing**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
