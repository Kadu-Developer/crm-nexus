# /speckit.specify — SaaS Foundation

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STEP 0 — FIND SKILLS (MANDATORY)
Before implementation, invoke/read `../.claude/skills/find-skills/SKILL.md`.
Audit and resolve the skills required for planning, testing, debugging, review and deployment.
Update `../SKILLS-AUDIT.md` and `../SKILLS-RESOLUTION.md`.
Do not continue to implementation if mandatory capabilities cannot be used safely.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**001 — SaaS Foundation**

## Objetivo
Estabelecer a fundação técnica do monorepo, configuração compartilhada, aplicações base, ambiente local e convenções de desenvolvimento.

## Escopo
- Monorepo com apps/web, apps/api e apps/worker
- Pacotes compartilhados de config, database, shared e ui
- PostgreSQL e Redis em desenvolvimento
- Docker Compose local
- Validação de variáveis de ambiente
- Health checks mínimos
- Scripts de lint, typecheck, test e build

## Dependências
- Nenhuma

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- Ambiente sobe com um único comando
- Web, API e Worker iniciam sem erro
- PostgreSQL e Redis ficam acessíveis
- Build e typecheck passam
- /health retorna 200

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **SaaS Foundation**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
