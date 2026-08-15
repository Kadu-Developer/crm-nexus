# /speckit.specify — Authentication

## STAGE GUARDRAIL
Read `../guardrails/01-specify.md`, `../SKILLS-POLICY.md` and the current `../STATE.json` before continuing.

## STATE CONTRACT
When this stage passes, update both `../STATE.json` and `../STATE.md`:
- `last_completed_file` = this file
- `current_stage` = `002-plan.md`
- `last_progress_at` = current ISO timestamp


## Feature
**002 — Authentication**

## Objetivo
Implementar autenticação segura para registro, login, sessão, logout e recuperação de senha.

## Escopo
- Cadastro de usuário
- Login
- Sessões HTTP-only
- Logout
- Forgot password
- Reset password
- Verificação de e-mail preparada
- Hash seguro de senha

## Dependências
- 001-saas-foundation

## Regras
- Não implementar funcionalidades fora deste escopo nesta etapa.
- Respeitar isolamento multi-tenant sempre que houver dados de workspace.
- Requisitos de segurança devem ser aplicados no backend.
- Operações pesadas devem ser assíncronas quando aplicável.
- Evitar acoplamento desnecessário com providers externos.
- Todo comportamento deve ser verificável por teste ou critério de aceite.

## Critérios de aceite
- Usuário consegue registrar e entrar
- Senha errada não autentica
- Sessão expirada é rejeitada
- Logout invalida a sessão
- Token de reset é de uso único

## Fora de escopo
- Features pertencentes às próximas specs.
- Otimizações prematuras sem evidência.
- Integrações não listadas nesta feature.

## Entrega esperada
Produzir uma implementação focada exclusivamente em **Authentication**, pronta para servir de base para a próxima feature.

---
NEXT:
Execute: `002-plan.md`
