# /speckit.specify — Multi-Tenancy & RBAC

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**003 — Multi-Tenancy & RBAC**

## Objetivo
Garantir isolamento de dados por workspace e autorização server-side baseada em permissões.

## Escopo
- Workspace
- WorkspaceMember
- Papéis OWNER/ADMIN/MANAGER/SDR/VIEWER
- Contexto de workspace por request
- Permission engine
- Proteção de endpoints
- Testes contra cross-tenant access

## Dependências
- 002-authentication

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- Usuário A não acessa recurso do workspace B
- Recursos tenant-owned sempre filtram por workspaceId
- Permissões são avaliadas no backend
- Acesso indevido retorna 404 quando apropriado

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Multi-Tenancy & RBAC**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
