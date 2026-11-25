import { api } from "@/lib/axios";
import { getAgendaDevCatalogo, type AuthorizationHeader } from "@/lib/auxiliar/catalogos";
import { parametrosProjetoMemoria } from "@/lib/casos/filtros-busca";
import { getPublicOrigin } from "@/lib/conector-claude/config";
import { comTokenDaConexao } from "@/lib/conector-claude/legacy-token";
import { temPermissao, type ConectorSession } from "@/lib/api-db/with-conector-permission";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import type { AgendaDevItem } from "@/services/auxiliar/get-agenda-dev";
import { linkDoCaso } from "./caso";
import { listarPessoas, listarProjetos } from "./catalogos";
import { dataLegado } from "./consulta";

/** Casos por produto e por status na agenda; o resto vira "+n no Painel" (decisão #32). */
export const MAX_CASOS_AGENDA = 10;
/** Chamadas simultâneas ao `projeto-memoria` (a API de dev leva segundos por chamada). */
const CONCORRENCIA = 4;

const s = (v: unknown) => (v == null ? "" : String(v).trim());
const n = (v: unknown) => {
  const x = Number(s(v));
  return Number.isFinite(x) ? x : 0;
};

export interface ProjetoSprint {
  id: string;
  nome: string;
  inicio?: string;
  fim?: string;
}

/** Hoje (AAAA-MM-DD) no fuso da squad. */
export function hojeSaoPaulo(agora = new Date()): string {
  return agora.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

/**
 * Sprint atual: projeto do setor com `inicio ≤ hoje ≤ fim`; com mais de um, o de início mais
 * recente (decidido na Fase 0). `null` quando nenhum período inclui hoje.
 */
export function escolherSprintAtual<T extends ProjetoSprint>(projetos: T[], hoje: string): T | null {
  const vigentes = projetos.filter((p) => p.inicio && p.fim && p.inicio <= hoje && hoje <= p.fim);
  if (!vigentes.length) return null;
  return [...vigentes].sort((a, b) => (b.inicio ?? "").localeCompare(a.inicio ?? ""))[0];
}

/** Importância decrescente (como o Painel) e, no empate, o número mais antigo primeiro. */
export function compararPorImportancia(a: ProjetoMemoriaItem, b: ProjetoMemoriaItem): number {
  const imp = n(b.caso.caracteristicas?.prioridade) - n(a.caso.caracteristicas?.prioridade);
  return imp !== 0 ? imp : a.caso.id - b.caso.id;
}

export const estaIniciado = (item: ProjetoMemoriaItem) =>
  s(item.caso.tempos?.status_tempo).toUpperCase() === "INICIADO";

/** Número, resumo, versão, status, importância e link. */
export function linhaCasoAgenda(item: ProjetoMemoriaItem, comProduto = false): string {
  const c = item.caso;
  const versao = comProduto
    ? [s(item.produto?.nome), s(item.produto?.versao)].filter(Boolean).join(" ")
    : `versão ${s(item.produto?.versao) || "-"}`;
  return `- ${[
    `#${c.id}`,
    s(c.textos?.descricao_resumo) || "(sem resumo)",
    versao,
    s(c.status?.descricao) || "-",
    `importância ${s(c.caracteristicas?.prioridade) || "-"}`,
    linkDoCaso(c.id),
  ].join(" · ")}`;
}

const plural = (qtd: number, palavra: string) => `${qtd} ${palavra}${qtd === 1 ? "" : "s"}`;

const nomeLinha = (row: AgendaDevItem) => [s(row.produto), s(row.versao)].filter(Boolean).join(" ");

/** Resultado das buscas de uma linha da agenda (produto + versão). */
export interface CasosDaLinha {
  row: AgendaDevItem;
  abertos: ProjetoMemoriaItem[];
  retornos: ProjetoMemoriaItem[];
}

export interface DadosAgenda {
  pessoa: string;
  sprint: ProjetoSprint | null;
  linhas: CasosDaLinha[];
  ehOutraPessoa: boolean;
}

function blocoPorProduto(
  linhas: CasosDaLinha[],
  chave: "abertos" | "retornos",
  contagem: (row: AgendaDevItem) => number,
): string[] {
  const out: string[] = [];
  for (const l of linhas) {
    const total = contagem(l.row);
    const itens = [...l[chave]].sort(compararPorImportancia);
    if (!total && !itens.length) continue;
    out.push(`### ${nomeLinha(l.row)} (${Math.max(total, itens.length)})`);
    out.push(...itens.map((i) => linhaCasoAgenda(i)));
    const resto = total - itens.length;
    if (resto > 0) out.push(`- +${resto} no Painel`);
  }
  return out;
}

/** Texto da agenda na ordem da decisão #32. Pura, para conferir com dados montados. */
export function formatarAgenda(d: DadosAgenda): string {
  const linhas = [...d.linhas].sort((a, b) => n(a.row.ordem) - n(b.row.ordem));
  const soma = (campo: keyof AgendaDevItem) => linhas.reduce((acc, l) => acc + n(l.row[campo]), 0);
  const sprint = d.sprint
    ? `sprint ${d.sprint.nome} (${d.sprint.id}${
        d.sprint.inicio && d.sprint.fim
          ? `, ${dataLegado(d.sprint.inicio, false)} a ${dataLegado(d.sprint.fim, false)}`
          : ""
      })`
    : "sem sprint em andamento no setor (agenda geral)";
  const out: string[] = [`Agenda de ${d.pessoa} · ${sprint}`];

  if (!linhas.length) {
    out.push(
      "",
      d.sprint
        ? "Nenhum caso nos produtos da agenda nesta sprint. Os produtos da agenda são configurados no Painel do desenvolvedor."
        : "A agenda está vazia. Os produtos da agenda são configurados no Painel do desenvolvedor.",
      `Painel: ${getPublicOrigin()}/painel`,
    );
    return out.join("\n");
  }

  out.push(
    `Totais: ${[
      plural(soma("abertos"), "aberto"),
      plural(soma("retornos"), "retorno"),
      plural(soma("corrigidos"), "corrigido"),
      plural(soma("resolvidos"), "resolvido"),
    ].join(" · ")}`,
  );

  // Em andamento: casos com o tempo iniciado (o mesmo campo do destaque do Painel).
  const iniciados = linhas.flatMap((l) => [...l.retornos, ...l.abertos].filter(estaIniciado));
  const semDetalhe = linhas.filter(
    (l) => s(l.row.tem_caso_iniciado) && !["0", "N"].includes(s(l.row.tem_caso_iniciado).toUpperCase()) &&
      ![...l.retornos, ...l.abertos].some(estaIniciado),
  );
  out.push("", "## Em andamento");
  if (iniciados.length) out.push(...iniciados.map((i) => linhaCasoAgenda(i, true)));
  out.push(...semDetalhe.map((l) => `- Há um caso iniciado em ${nomeLinha(l.row)}; veja no Painel.`));
  if (!iniciados.length && !semDetalhe.length) out.push("- Nenhum caso iniciado.");

  const retornos = blocoPorProduto(linhas, "retornos", (r) => n(r.retornos));
  out.push("", "## Retornos");
  out.push(...(retornos.length ? retornos : ["- Nenhum retorno."]));

  const abertos = blocoPorProduto(linhas, "abertos", (r) => n(r.abertos));
  out.push("", "## Abertos");
  out.push(...(abertos.length ? abertos : ["- Nenhum caso aberto."]));

  const concluidos = linhas.filter((l) => n(l.row.corrigidos) || n(l.row.resolvidos));
  out.push("", "## Corrigidos e resolvidos");
  out.push(
    ...(concluidos.length
      ? concluidos.map(
          (l) =>
            `- ${nomeLinha(l.row)}: ${plural(n(l.row.corrigidos), "corrigido")}, ${plural(n(l.row.resolvidos), "resolvido")}`,
        )
      : ["- Nenhum."]),
    "",
    `Painel: ${getPublicOrigin()}/painel`,
  );
  if (d.ehOutraPessoa) out.push(`No Painel, use "Ver como" para ver a agenda de ${d.pessoa}.`);
  return out.join("\n");
}

async function emLotes<T, R>(itens: T[], limite: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(itens.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limite, itens.length) }, async () => {
      while (i < itens.length) {
        const k = i++;
        out[k] = await fn(itens[k]);
      }
    }),
  );
  return out;
}

async function casosDaLinha(
  auth: AuthorizationHeader,
  pessoaId: string,
  row: AgendaDevItem,
  projetoId: string | undefined,
): Promise<CasosDaLinha> {
  const buscar = async (status: string[], comProjeto: boolean) => {
    const r = await api.get("/projeto-memoria", {
      params: parametrosProjetoMemoria(
        {
          usuario_dev_id: pessoaId,
          produto_id: s(row.id_produto),
          versao_produto: s(row.versao),
          projeto_id: comProjeto ? projetoId : undefined,
          status_ids: status,
        },
        { per_page: MAX_CASOS_AGENDA, sort_by: "prioridade", sort_order: "DESC" },
      ),
      headers: auth,
    });
    return (r.data?.data ?? []) as ProjetoMemoriaItem[];
  };
  // Mesmas consultas das colunas do Painel: abertos 1 e 2 na sprint; retornos (4) sem a sprint.
  const [abertos, retornos] = await Promise.all([
    n(row.abertos) > 0 ? buscar(["1", "2"], true) : Promise.resolve([]),
    n(row.retornos) > 0 ? buscar(["4"], false) : Promise.resolve([]),
  ]);
  return { row, abertos, retornos };
}

export interface AgendaInput {
  pessoa_id?: string;
  projeto_id?: string;
}

/** `softflow_agenda`: o que fazer agora na sprint atual (decisões #32 e #33). */
export async function montarAgenda(session: ConectorSession, input: AgendaInput) {
  const { appUser, permissions } = session;
  const proprioId = String(appUser.legacyUserId);
  const pessoaId = s(input.pessoa_id) || proprioId;
  const ehOutraPessoa = pessoaId !== proprioId;
  if (ehOutraPessoa && !temPermissao(permissions, "audit-all-users")) {
    return {
      erro: true,
      texto: "Seu perfil no Softflow não permite ver a agenda de outra pessoa (é a mesma regra do \"Ver como\" do Painel). Sem pessoa_id, mostro a sua.",
    };
  }

  return comTokenDaConexao(session.conexao, async (auth) => {
    let pessoa = appUser.nome;
    let setor = appUser.setor;
    if (ehOutraPessoa) {
      const p = (await listarPessoas(auth)).find((x) => x.id === pessoaId);
      if (!p) return { erro: true, texto: `Pessoa ${pessoaId} não encontrada. Use softflow_buscar_opcoes com tipo "pessoa".` };
      pessoa = p.nome;
      setor = p.detalhe ?? "";
    }

    const projetos = await listarProjetos(auth, appUser.legacyUserId, { setor: setor || undefined });
    let sprint: ProjetoSprint | null;
    if (s(input.projeto_id)) {
      sprint = projetos.find((p) => p.id === s(input.projeto_id)) ?? { id: s(input.projeto_id), nome: `projeto ${s(input.projeto_id)}` };
    } else {
      sprint = escolherSprintAtual(projetos, hojeSaoPaulo());
    }

    const { data } = await getAgendaDevCatalogo(auth, {
      id_colaborador: pessoaId,
      Cronograma_id: sprint?.id,
    });
    const rows = (Array.isArray(data) ? data : []) as AgendaDevItem[];
    const linhas = await emLotes(rows, CONCORRENCIA, (row) => casosDaLinha(auth, pessoaId, row, sprint?.id));
    return { erro: false, texto: formatarAgenda({ pessoa, sprint, linhas, ehOutraPessoa }) };
  });
}
