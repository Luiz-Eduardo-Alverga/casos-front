# Assistente de IA (Assistant)

> **Estado: implementado.** README inicial escrito em 2026-11-17 a partir do código (levantamento,
> sem verificação no navegador). Completar ao mexer no módulo.

## O que é

O **Assistant** é um serviço externo da Softcom (`NEXT_PUBLIC_ASSISTANT_API_URL`, roda fora do
processo Next) que o Softflow usa em três lugares:

1. **Abertura de caso e report** (`caso-create`, `report-create`): a partir de um texto livre (e
   anexos), preenche a descrição do caso/report usando o prompt do squad (setor) ou o padrão.
2. **Registro de liberação:** gera a descrição/release notes dos casos da versão, em streaming
   (ver [`liberacoes/`](../liberacoes/README.md)).
3. **Auditoria de horas:** análise de produção (ver [`auditoria-horas/`](../auditoria-horas/README.md)).

Os prompts são cadastrados em Configurações → Prompts IA (ver
[`configuracoes/`](../configuracoes/README.md)).

## Arquitetura

| Uso | Caminho no Softflow | Proteção |
|-----|---------------------|----------|
| Preencher caso/report | `services/ia/assistant.tsx` → `POST /api/assistant` → Assistant `/api/assistant` (repassa `squadSetor`) | sessão (`requireSessionAuth`) |
| Release notes | `services/ia/release-notes.ts` → `/api/release-notes/[liberacaoId]` e `/stream` → Assistant | `withPermission("edit-release")` |
| Análise de produção | `services/ia/get-production-analysis.ts` → Assistant direto do browser (`apiAssistant`) | nenhuma no Next |
| Prompts | `services/ia/form-assistant-prompts.ts` → `/api/form-assistant-prompts` (`/default`, `/selectable`, `/squad/{setor}`, `/{id}/toggle`) | permissões `*-prompts` |

Cliente HTTP: `apiAssistant` em `lib/axios.ts`.

## Lacunas do levantamento

- A análise de produção é a única chamada que vai do browser direto ao Assistant (detalhe em
  [`auditoria-horas/`](../auditoria-horas/README.md)).
- Os prompts ficam no próprio Assistant: `/api/form-assistant-prompts` do Softflow é proxy
  (`apiAssistant`) protegido por `withPermission`.
