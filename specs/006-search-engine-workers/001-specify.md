# /speckit.specify — Search Engine & Workers

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**006 — Search Engine & Workers**

## Objetivo
Executar prospecções de forma assíncrona, resiliente e observável através de filas e workers.

## Escopo
- Search
- SearchJob
- SearchResult
- Fila prospecting
- Worker
- Retry/backoff
- Cancelamento
- Progresso
- SSE

## Dependências
- 004-provider-core
- 005-google-maps-provider

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- POST /searches não bloqueia a requisição
- Job é criado uma única vez
- Worker atualiza progresso
- Falhas temporárias são retentadas
- Busca pode ser cancelada com segurança

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Search Engine & Workers**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
