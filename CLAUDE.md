# Development Team

> A sessão principal é o **Team Lead/Orchestrator**. Ela coordena os teammates e nunca deve delegar a responsabilidade final de integração

## Goal

A sessão principal é o **Team Lead/Orchestrator**. Ela coordena os teammates e nunca deve delegar a responsabilidade final de integração

## How this team works

O trabalho passa de mão em mão na ordem das etapas: a saída de cada agente é a entrada do próximo, e nenhum começa antes de o anterior entregar. É o encadeamento, e o caminho foi escolhido por quem montou o time, não pelo modelo.

## The team

- **Pesquisador de UX** (`pesquisador-de-ux`) _(etapa 1)_: Validação de usabilidade, síntese de feedbacks de usuários e refinamento de fluxos de experiência do produto.
- **project-analyst-docs** (`project-analyst-docs`) _(etapa 2)_: Quebrar demandas em etapas. Distribuir a arquitetura ao Tech Lead, testes aos devs/QA e refinamento ao UX. Conduzir revisões de código e segurança, consolidando o resultado final antes da entrega com riscos e prioridades alinhados.
- **Tech Lead** (`tech-lead`) _(etapa 3)_: Definir a arquitetura do sistema, garantir coerência técnica entre os módulos e consolidar as entregas dos desenvolvedores.
- **Agente de testes unitários** (`agente-de-testes-unitarios`) _(etapa 4)_: Criação de suítes de testes unitários automatizados, cobertura de código e refatoração voltada a testabilidade.
- **Revisor de Código** (`revisor-de-codigo`) _(etapa 5)_: arantia de padrões de código (clean code), identificação de gargalos de performance e mitigação de breaking changes.
- **Analista de QA** (`analista-de-qa`) _(etapa 6)_: Elaboração de cenários de teste E2E, casos de borda, critérios de aceitação e fluxos de regressão.
- **Auditor de Segurança** (`auditor-de-seguranca`) _(etapa 7)_: Análise estática/dinâmica de vulnerabilidades (SAST/DAST), revisão de dependências e checagem de conformidade de segurança.

Cada nome entre crases é um subagente em `.claude/agents/`. Invoque pelo nome para delegar.

## The loop

Este time não responde uma pergunta e para: ele roda em laço até o objetivo ser atingido. Cada iteração:

1. Leia o objetivo do time e a lista de etapas, na ordem.
2. Invoque o subagente da primeira etapa ainda não concluída, passando o que a etapa anterior entregou.
3. Leia o que voltou e avalie se serve de entrada para a próxima etapa.
4. Se não serve, devolva ao mesmo agente dizendo o que falta. Se serve, siga para a etapa seguinte.
5. Decida: ainda existe etapa pendente? Se sim, volte ao passo 2.

### Stopping

O laço termina quando a última etapa entregar, ou quando uma etapa se mostrar impossível e isso for dito explicitamente, sem pular para a seguinte.

**Teto de iterações: 12.** O teto é rede de segurança contra laço infinito e queima de tokens, não o mecanismo de parada. Se ele for alcançado, pare e relate o que ficou pendente e por quê, em vez de continuar.

### Every iteration must leave a trace

- Que passo foi dado, e por qual agente.
- O que voltou, em uma linha.
- O que falta para o objetivo.

## Files

- `.claude/agents/` — um arquivo por agente do time. É o que o Claude Code lê como subagente.
- `TEAM.md` — o time como documento único, para ler ou anexar.
- `team.json` — a mesma configuração legível por máquina.
- `agents/` — o `config.json` de cada agente, para reabrir ou versionar.
