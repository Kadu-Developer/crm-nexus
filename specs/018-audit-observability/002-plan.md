# /speckit.plan — Audit & Observability

## STAGE GUARDRAIL
Read `../guardrails/02-plan.md` and `../SKILLS-RESOLUTION.md`.

## REPOSITORY-EVIDENCE GATE
Before this plan is considered executable:
- inspect the real ProspectFlow repository;
- replace assumptions with actual paths/modules;
- map every acceptance criterion from `001-specify.md` to code + verification;
- explicitly address: **PII/secrets in logs, missing correlation, false health, noisy alerts**;
- document rollback for schema/data/infra changes.

## STATE CONTRACT
On PASS, set `current_stage` to `003-tasks.md` in both state files.


## Objetivo técnico
Tornar ações críticas, requests, jobs e falhas rastreáveis em produção.

## Dependências obrigatórias
- 001-saas-foundation

## Direção técnica
- Structured logger
- Error tracking provider
- Health endpoints

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
- Toda ação crítica gera audit log
- Cada request possui requestId
- Jobs têm correlação com searchId
- Falhas podem ser rastreadas sem expor secrets

---
NEXT:
Execute: `003-tasks.md`
