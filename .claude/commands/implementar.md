---
description: Implementa uma especificação planejada em docs/<slug>/, começando pela Fase 0 e parando em perguntas abertas
argument-hint: "[slug]"
---

Implementar especificação planejada. Argumento recebido: `$ARGUMENTS`

Siga a seção "Fluxo planejamento → especificação → código" do `CLAUDE.md`. Este comando só organiza a ordem.

## 0. Preparar

1. Garanta que está na `dev` e atualizada: `git checkout dev && git pull --ff-only origin dev`. Se houver alteração local não commitada, pare e pergunte.
2. Sem argumento: liste as especificações pendentes e as perguntas abertas, e pergunte qual implementar.
   ```bash
   grep -l "Estado: planejado\|Próxima mudança planejada" docs/*/README.md
   grep -n "· aberta" docs/*/README.md
   ```
   Com argumento: a pasta é `docs/$ARGUMENTS/`. Se ela não existir ou não tiver nada planejado, diga isso e pare.

## 1. Retomar de onde parou

Leia inteiros `README.md`, `decisoes.md` e a lista de `prototipo/` da pasta. Depois:

- **Perguntas abertas** (`### P<n> — ... · aberta` na seção "Perguntas do Claude Code"): mostre cada uma ao usuário e pare. Ele pode responder aqui mesmo (vá para o passo 4) ou no chat de planejamento; nesse caso ele roda `/implementar $ARGUMENTS` de novo depois.
- **Perguntas respondidas desde a última vez**: leia as decisões que elas geraram antes de seguir.
- **Andamento**: a seção "Andamento da implementação" do README e `git log --oneline --grep "($ARGUMENTS)"` dizem quais partes já foram entregues. Continue pela próxima.
- Nada entregue e Fase 0 não feita: comece pela Fase 0.

## 2. Fase 0 (antes de qualquer código)

Confira o plano contra o código: os arquivos citados existem, o que seria reaproveitado serve, nenhuma decisão conflita com `decisoes.md` de outra pasta, as "Perguntas em aberto" do planejamento têm resposta. Relate ao usuário o que diverge.

Toda dúvida que dependa de uma decisão do usuário vira pergunta registrada (passo 3). Detalhe técnico que o código resolve, decida você e mencione no relato.

Ao fim da Fase 0 sem perguntas abertas, crie no README a seção "Andamento da implementação" com uma caixa por parte do plano (`- [ ] Parte 1: ...`) e espere o ok do usuário para começar a Parte 1.

## 3. Registrar uma pergunta

Na seção `## Perguntas do Claude Code` do README da pasta (crie antes de "Plano de implementação" se não existir), numeração contínua:

```markdown
### P<n> — <título curto> · aberta

Fase: <Fase 0 | Parte N> (AAAA-MM-DD). Contexto: <o que encontrou no código, com caminhos>.
Opções: **A)** <...> **B)** <...>
Recomendação do Claude Code: <opção> porque <motivo>.
```

Junte as perguntas do momento num commit só e envie para que o chat de planejamento enxergue:

```bash
git add docs/$ARGUMENTS/
git commit -m "docs($ARGUMENTS): perguntas da <fase>"
git push origin dev
```

Mostre as perguntas ao usuário e pare.

## 4. Registrar uma resposta dada aqui

Quando o usuário responder no terminal:

1. Acrescente a decisão em `decisoes.md`, continuando a numeração, com o porquê.
2. Troque o cabeçalho da pergunta para `### P<n> — <título> · respondida → decisão #<m>` e acrescente `Resposta (AAAA-MM-DD, Claude Code): <resumo>`.
3. Commit `docs($ARGUMENTS): resposta da P<n>` e push. Siga com o trabalho.

## 5. Implementar

Uma parte do "Plano de implementação" por vez, um commit por entrega com escopo `($ARGUMENTS)` (ex.: `feat($ARGUMENTS): ... (Parte 2)`), marcando a caixa no "Andamento da implementação". Antes de cada commit, rode `npm run lint` e `npm run build`. Dúvida no meio de uma parte: volte ao passo 3.

## 6. Concluir

Quando todas as partes estiverem entregues, siga o passo 4 da seção do fluxo no `CLAUDE.md`. Reescreva o README no formato padrão, mantendo o histórico de perguntas como referência. Atualize `docs/contexto-projeto-softflow.md` e `docs/status-projeto-softflow.md`. Se algum token ou componente do `docs/design-system.md` mudou, atualize-o também.
