# /speckit.implement — SaaS Foundation

## STAGE GUARDRAIL
Read `../guardrails/04-implement.md`.

## EXECUTION CONTRACT
- Work task-by-task from `003-tasks.md`.
- Use TDD where appropriate.
- On any failure, use a systematic debugging procedure before changing multiple things.
- Do not advance directly to the next feature.
- Critical adversarial focus: **environment reproducibility, dependency drift, health correctness, unsafe defaults**.

## STATE CONTRACT
On implementation PASS, set `current_stage` to `005-tests.md`.


## Instrução
Implemente **somente** a feature **001 — SaaS Foundation** seguindo:

1. `001-specify.md`
2. `002-plan.md`
3. `003-tasks.md`

## Modo de execução
- Execute as tasks na ordem definida em `003-tasks.md`.
- Marque cada task concluída no próprio arquivo.
- Faça alterações pequenas e verificáveis.
- Não pule testes obrigatórios.
- Não avance para a próxima feature com testes quebrados.
- Não invente requisitos fora da spec.
- Ao encontrar conflito, priorize `001-specify.md`, depois `002-plan.md`, depois `003-tasks.md`.

## Verificações obrigatórias
- lint;
- typecheck;
- testes unitários relevantes;
- testes de integração relevantes;
- build;
- validação dos critérios de aceite.

## Critérios de aceite da feature
- Ambiente sobe com um único comando
- Web, API e Worker iniciam sem erro
- PostgreSQL e Redis ficam acessíveis
- Build e typecheck passam
- /health retorna 200

## Resultado final esperado
A feature **SaaS Foundation** deve estar funcional, testada e integrada ao estado atual do ProspectFlow.

## Encerramento
Ao concluir:
1. Atualize as caixas de seleção em `003-tasks.md`.
2. Registre qualquer decisão técnica relevante.
3. Confirme que os critérios de aceite foram atendidos.
4. Execute o próximo arquivo abaixo.

---
NEXT:
Execute: `005-tests.md`
