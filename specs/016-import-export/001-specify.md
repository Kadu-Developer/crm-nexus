# /speckit.specify — Import & Export

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**016 — Import & Export**

## Objetivo
Permitir importação e exportação segura de leads em CSV/XLSX usando processamento assíncrono.

## Escopo
- Import
- Export
- Upload
- Mapeamento de colunas
- Preview
- Worker
- CSV/XLSX
- Storage abstraction

## Dependências
- 008-deduplication
- 014-plans-billing

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- Import usa deduplicação existente
- Export respeita RBAC e plano
- Arquivos grandes não bloqueiam request HTTP
- Download só é liberado ao workspace correto

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Import & Export**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
