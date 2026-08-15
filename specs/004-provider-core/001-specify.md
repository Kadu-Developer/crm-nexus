# /speckit.specify — Provider Core

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**004 — Provider Core**

## Objetivo
Criar o contrato genérico que permitirá adicionar fontes de prospecção sem acoplar o domínio principal a cada integração.

## Escopo
- ProspectingProvider interface
- Provider registry
- Capabilities
- Health check
- Status de provider
- Configuração por provider
- Mapeamento de erros

## Dependências
- 001-saas-foundation
- 003-multi-tenancy-rbac

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- MockProvider pode ser registrado e executado
- Provider desconhecido gera erro controlado
- Provider pode ser ativado/desativado sem mudar o core
- Erros externos são normalizados

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Provider Core**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
