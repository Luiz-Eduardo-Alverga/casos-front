import { api } from "@/lib/axios";
import { temPermissao, type ConectorSession } from "@/lib/api-db/with-conector-permission";
import { comTokenDaConexao } from "@/lib/conector-claude/legacy-token";
import { SIGNED_DOWNLOAD_TTL_SEC } from "@/lib/constants/case-attachments";
import { listCaseAttachmentsByRegistro } from "@/lib/db/case-attachments";
import { createCaseAttachmentSignedDownloadUrl } from "@/lib/storage/case-attachments";
import { getS3Client } from "@/lib/storage/s3";
import type {
  AnotacaoCasoItem,
  CasoRelacoes,
  ClienteCasoItem,
} from "@/interfaces/projeto-memoria";
import { erroDaApi, linkDoCaso } from "./caso";

/** Seções que `softflow_consultar_caso` sabe devolver (decisão #22). */
export const SECOES_CONSULTA = [
  "descricao",
  "anotacoes",
  "clientes",
  "relacoes",
  "anexos",
] as const;
export type SecaoConsulta = (typeof SECOES_CONSULTA)[number];

export const MAX_ANOTACOES = 30;

const s = (v: unknown) => (v == null ? "" : String(v).trim());

/** Texto do legado como veio, só com as quebras de linha normalizadas. */
const textoLegado = (v: unknown) => s(v).replace(/\r\n?/g, "\n");

/**
 * Data do legado (`2026-11-19 16:50:00`, `2026-11-19T16:50:00` ou `2026-11-19`) como
 * `dd/MM/yyyy HH:mm` / `dd/MM/yyyy`, sem converter fuso: o legado já devolve a hora local.
 */
export function dataLegado(v: unknown, comHora = true): string {
  const m = s(v).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return s(v) || "-";
  const data = `${m[3]}/${m[2]}/${m[1]}`;
  return comHora && m[4] ? `${data} ${m[4]}:${m[5]}` : data;
}

/** Item de lista em Markdown com as linhas seguintes recuadas, para não quebrar a lista. */
const itemLista = (t: string) => `- ${t.replace(/\n/g, "\n  ")}`;

function tamanho(bytes: number | null | undefined): string {
  const b = Number(bytes ?? 0);
  if (b >= 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  if (b >= 1024) return `${Math.round(b / 1024)} KB`;
  return `${b} B`;
}

const dataHoraBrasil = (d: Date | null) =>
  d
    ? d.toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(",", "")
    : "-";

export function secaoTextos(textos: Record<string, unknown> | undefined): string[] {
  const blocos: [string, unknown][] = [
    ["Descrição", textos?.descricao_completa],
    ["Passos para reproduzir", textos?.passos_para_reproduzir],
    ["Informações adicionais", textos?.informacoes_adicionais],
    ["História", textos?.historia],
  ];
  return blocos
    .map(([titulo, valor]) => [titulo, textoLegado(valor)] as const)
    .filter(([, valor]) => valor)
    .map(([titulo, valor]) => `## ${titulo}\n\n${valor}`);
}

/** Da mais recente para a mais antiga; acima de 30, as 30 mais recentes e a contagem do resto. */
export function secaoAnotacoes(anotacoes: AnotacaoCasoItem[] | undefined): string | null {
  const lista = [...(anotacoes ?? [])].filter((a) => textoLegado(a.anotacoes));
  if (!lista.length) return null;
  lista.sort(
    (a, b) =>
      s(b.data_anotacao).localeCompare(s(a.data_anotacao)) ||
      Number(b.sequencia ?? 0) - Number(a.sequencia ?? 0),
  );
  const mostradas = lista.slice(0, MAX_ANOTACOES);
  const linhas = mostradas.map((a) =>
    itemLista(
      `${dataLegado(a.data_anotacao)} · ${s(a.usuario) || "-"}: ${textoLegado(a.anotacoes)}`,
    ),
  );
  const resto = lista.length - mostradas.length;
  if (resto > 0) {
    linhas.push(`+${resto} ${resto === 1 ? "anotação antiga" : "anotações antigas"} no Softflow`);
  }
  return `## Anotações (${lista.length})\n\n${linhas.join("\n")}`;
}

export function secaoClientes(clientes: ClienteCasoItem[] | undefined): string | null {
  const lista = clientes ?? [];
  if (!lista.length) return null;
  const linhas = lista.map((c) => {
    const nome = s(c.cliente_nome) || `Cliente ${s(c.cliente)}`;
    return `- ${nome} (código ${s(c.cliente)}) · incidente ${s(c.incidente) || "-"} · ${dataLegado(c.data_solicitacao, false)}`;
  });
  return `## Clientes (${lista.length})\n\n${linhas.join("\n")}`;
}

export function secaoRelacoes(relacoes: CasoRelacoes[] | undefined): string | null {
  const lista = relacoes ?? [];
  if (!lista.length) return null;
  const linhas = lista.map((r) => {
    const tipo = s(r.tipo_relacao_nome) || "Relacionado";
    const resumo = s(r.descricao_resumo) || "(sem resumo)";
    return `- ${tipo} do caso ${s(r.caso_relacionado)}: ${resumo} (${linkDoCaso(r.caso_relacionado)})`;
  });
  return `## Relações (${lista.length})\n\n${linhas.join("\n")}`;
}

/** Lista os anexos com link assinado (decisão #23); só com `list-case-attachment`. */
export async function secaoAnexos(session: ConectorSession, registro: number): Promise<string | null> {
  if (!temPermissao(session.permissions, "list-case-attachment")) {
    return "## Anexos\n\nSeu perfil não permite ver os anexos.";
  }
  try {
    getS3Client();
    const rows = await listCaseAttachmentsByRegistro(registro);
    if (!rows.length) return null;
    const linhas = await Promise.all(
      rows.map(async (row) => {
        const url = await createCaseAttachmentSignedDownloadUrl(row.path);
        return `- ${row.filenameOriginal} · ${tamanho(row.sizeBytes)} · ${dataHoraBrasil(row.createdAt)} · ${url}`;
      }),
    );
    const minutos = Math.round(SIGNED_DOWNLOAD_TTL_SEC / 60);
    return [
      `## Anexos (${rows.length})`,
      "",
      `Os links vencem em ${minutos} minutos; consulte de novo para gerar outros.`,
      "",
      ...linhas,
    ].join("\n");
  } catch (error) {
    console.error("[conector-claude] anexos da consulta", error);
    return "## Anexos\n\nNão foi possível listar os anexos agora.";
  }
}

/** Reserva para quando `projeto-memoria` não trouxer a chave `relacoes` (não acontece hoje). */
async function buscarRelacoes(
  session: ConectorSession,
  registro: string,
): Promise<CasoRelacoes[]> {
  try {
    const data = await comTokenDaConexao(session.conexao, async (auth) => {
      const r = await api.get("/projeto-casos-relacoes", { params: { registro }, headers: auth });
      return r.data as { data?: unknown };
    });
    const lista = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return lista as CasoRelacoes[];
  } catch {
    return [];
  }
}

/**
 * Caso completo pelo número (decisão #22): cabeçalho de sempre e, em Markdown, textos, anotações,
 * clientes, relações e anexos, cada seção só com conteúdo. `secoes` restringe o que vem.
 */
export async function consultarCaso(
  session: ConectorSession,
  registro: string,
  secoes: readonly SecaoConsulta[] = SECOES_CONSULTA,
): Promise<string> {
  const id = s(registro).replace(/^#/, "");
  if (!/^\d+$/.test(id)) return "Informe o número do caso (só dígitos).";
  const quer = new Set(secoes.length ? secoes : SECOES_CONSULTA);
  try {
    const data = await comTokenDaConexao(session.conexao, async (auth) => {
      const r = await api.get(`/projeto-memoria/${id}`, { headers: auth });
      return r.data as { data?: Record<string, any> };
    });
    const item = data?.data;
    if (!item?.caso) return `Caso ${id} não encontrado.`;
    const { caso, produto, projeto } = item;

    const partes: string[] = [
      [
        `Caso ${caso.id}: ${s(caso.textos?.descricao_resumo) || "(sem resumo)"}`,
        `- Produto: ${s(produto?.nome)} (${s(produto?.id)}), versão ${s(produto?.versao) || "-"}`,
        `- Projeto: ${s(projeto?.descricao)} (${s(projeto?.id)})`,
        `- Status: ${s(caso.status?.descricao) || "-"}`,
        `- Dev: ${s(caso.usuarios?.desenvolvimento?.nome) || "-"}; QA: ${s(caso.usuarios?.qa?.nome) || "-"}`,
        `- Relator: ${s(caso.usuarios?.relator?.nome) || "-"}; aberto em ${s(caso.datas?.abertura).slice(0, 10) || "-"}`,
        `- Importância: ${s(caso.caracteristicas?.prioridade) || "-"}; categoria: ${s(caso.caracteristicas?.tipo_categoria) || "-"}`,
        `- Link: ${linkDoCaso(caso.id)}`,
      ].join("\n"),
    ];

    if (quer.has("descricao")) partes.push(...secaoTextos(caso.textos));
    if (quer.has("anotacoes")) {
      const sec = secaoAnotacoes(caso.anotacoes);
      if (sec) partes.push(sec);
    }
    if (quer.has("clientes")) {
      const sec = secaoClientes(caso.clientes);
      if (sec) partes.push(sec);
    }
    if (quer.has("relacoes")) {
      const relacoes = Array.isArray(caso.relacoes) ? caso.relacoes : await buscarRelacoes(session, id);
      const sec = secaoRelacoes(relacoes);
      if (sec) partes.push(sec);
    }
    if (quer.has("anexos")) {
      const sec = await secaoAnexos(session, Number(id));
      if (sec) partes.push(sec);
    }
    return partes.join("\n\n");
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 404) return `Caso ${id} não encontrado.`;
    return `Não foi possível consultar o caso ${id}: ${erroDaApi(error, "erro na consulta")}.`;
  }
}
