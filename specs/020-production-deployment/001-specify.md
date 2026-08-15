# /speckit.specify — Production Deployment

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**020 — Production Deployment**

## Objetivo
Preparar deploy reproduzível em VPS com HTTPS, backups, CI/CD e procedimentos de recuperação.

## Escopo
- Production Docker images
- Compose de produção
- Reverse proxy
- HTTPS
- Migrations
- Backups PostgreSQL
- Restore testado
- CI/CD
- Runbook

## Dependências
- 019-security-hardening
- 017-admin-panel

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- Deploy sobe web/api/worker
- HTTPS funciona
- Migrations rodam de forma controlada
- Backup automático existe
- Restore foi testado
- Health checks são monitoráveis

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Production Deployment**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
