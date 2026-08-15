# /speckit.plan — Lists & Tags

## STAGE GUARDRAIL
Read `../guardrails/02-plan.md` and `../SKILLS-RESOLUTION.md`.

## REPOSITORY-EVIDENCE GATE
Before this plan is considered executable:
- inspect the real ProspectFlow repository;
- replace assumptions with actual paths/modules;
- map every acceptance criterion from `001-specify.md` to code + verification;
- explicitly address: **orphan relations, duplicate associations, cross-tenant tagging**;
- document rollback for schema/data/infra changes.

## STATE CONTRACT
On PASS, set `current_stage` to `003-tasks.md` in both state files.


## Objetivo técnico
Permitir organização operacional de leads através de listas e tags por workspace.

## Dependências obrigatórias
- 007-lead-management

## Direção técnica
- Many-to-many
- Bulk endpoints
- Optimistic UI controlada

## Arquitetura e responsabilidades
1. Separar domínio, infraestrutura e interface sempre que a feature exigir.
2. Não colocar regra de negócio em componentes de UI.
3. Não acessar banco diretamente do frontend.
4. Validar toda entrada externa.
5. Preservar idempotência em operações com efeito financeiro ou processamento assíncrono.
6. Produzir logs úteis sem registrar secrets.

## Dados
- Criar apenas tabelas/campos necessários a esta feature.
- Incluir `workspaceId` em todo recurso tenant-owned.
- Criar índices e constraints que protejam integridade.
- Preferir transações quando múltiplas gravações formarem uma única operação lógica.

## API
- Usar `/api/v1` para endpoints públicos internos do produto.
- Retornar erros no contrato padrão da aplicação.
- Aplicar autenticação, workspace context e RBAC quando necessário.

## UI
- Reutilizar o design system.
- Implementar loading, empty state, error state e feedback de sucesso.
- Não carregar coleções grandes integralmente no navegador.

## Testes
- Unitários para regras puras.
- Integração para banco, filas e API.
- Segurança para isolamento de tenant quando aplicável.
- E2E apenas para jornadas críticas.

## Critérios de conclusão
- Lead pode pertencer a várias listas
- Tag pertence ao workspace
- Bulk action respeita RBAC
- Remover da lista não remove o lead

---
NEXT:
Execute: `003-tasks.md`
