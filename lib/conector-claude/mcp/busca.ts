import { api } from "@/lib/axios";
import { getVersoesCatalogo, type AuthorizationHeader } from "@/lib/auxiliar/catalogos";
import {
  parametrosProjetoMemoria,
  temFiltroBusca,
  type FiltrosBuscaCasos,
} from "@/lib/casos/filtros-busca";
import { resolveVersaoProdutoForApi } from "@/lib/casos/versao-produto";
import { comTokenDaConexao } from "@/lib/conector-claude/legacy-token";
import type { ConectorSession } from "@/lib/api-db/with-conector-permission";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import type { Versao } from "@/services/auxiliar/versoes";
import { linkDoCaso } from "./caso";
import { listarStatus, normalizar, type Opcao } from "./catalogos";
import { dataLegado } from "./consulta";

/** Casos por página da busca (decisão #30). */
export const POR_PAGINA_BUSCA = 20;

export interface BuscarCasosInput {
  texto?: string;
  produto_id?: string;
  versao?: string;
  status?: string[];
  modulo?: string;
  projeto_id?: string;
  setor?: string;
  tipo?: "CASO" | "REPORT";
  dev_id?: string;
  qa_id?: string;
  relator_id?: string;
  aberto_de?: string;
  aberto_ate?: string;
  producao_de?: string;
  producao_ate?: string;
  nao_planejado?: boolean;
  cursor?: string;
}

const s = (v: unknown) => (v == null ? "" : String(v).trim());

/**
 * O legado pagina só por cursor (o `page` é ignorado; conferido em 2026-11-25). O cursor da
 * ferramenta leva o do legado e o número da página, para a resposta dizer "página p de n".
 */
export function codificarCursor(cursorLegado: string, pagina: number): string {
  return Buffer.from(JSON.stringify({ c: cursorLegado, p: pagina })).toString("base64url");
}

export function decodificarCursor(cursor: string | undefined): { c: string; p: number } | null {
  if (!s(cursor)) return null;
  try {
    const v = JSON.parse(Buffer.from(s(cursor), "base64url").toString("utf8")) as { c?: unknown; p?: unknown };
    const p = Number(v.p);
    if (typeof v.c !== "string" || !v.c || !Number.isInteger(p) || p < 2) return null;
    return { c: v.c, p };
  } catch {
    return null;
  }
}

/** Status por id ou nome (sem acento/caixa); devolve os ids e o que não foi reconhecido. */
export function resolverStatus(pedidos: string[], catalogo: Opcao[]) {
  const ids: string[] = [];
  const naoEncontrados: string[] = [];
  for (const pedido of pedidos.map(s).filter(Boolean)) {
    const alvo = normalizar(pedido);
    const achado =
      catalogo.find((o) => o.id === pedido) ??
      catalogo.find((o) => normalizar(o.nome) === alvo) ??
      (() => {
        const parciais = catalogo.filter((o) => normalizar(o.nome).includes(alvo));
        return parciais.length === 1 ? parciais[0] : undefined;
      })();
    if (achado) {
      if (!ids.includes(achado.id)) ids.push(achado.id);
    } else {
      naoEncontrados.push(pedido);
    }
  }
  return { ids, naoEncontrados };
}

/** Uma linha por caso: número, resumo, produto e versão, status, dev, abertura e link. */
export function linhaCaso(item: ProjetoMemoriaItem): string {
  const c = item.caso;
  const produto = [s(item.produto?.nome), s(item.produto?.versao)].filter(Boolean).join(" ");
  const partes = [
    `#${c.id}`,
    s(c.textos?.descricao_resumo) || "(sem resumo)",
    produto || "-",
    s(c.status?.descricao) || s(c.status?.status_tipo) || "-",
    `dev ${s(c.usuarios?.desenvolvimento?.nome) || "-"}`,
    `aberto em ${dataLegado(c.datas?.abertura, false)}`,
    linkDoCaso(c.id),
  ];
  return `- ${partes.join(" · ")}`;
}

async function versaoParaFiltro(auth: AuthorizationHeader, produtoId: string, versao: string) {
  if (!versao || !produtoId || !/^\d+$/.test(versao)) return versao;
  // Pode ser a sequência do catálogo (softflow_buscar_opcoes); inclui versões fechadas.
  const { data } = await getVersoesCatalogo(auth, { produto_id: produtoId, todas: true });
  const bruto = Array.isArray(data) ? data : (data as { data?: unknown } | null)?.data;
  const versoes = Array.isArray(bruto) ? (bruto as Versao[]) : [];
  return resolveVersaoProdutoForApi(versao, versoes) || versao;
}

/** `softflow_buscar_casos`: mesmos filtros da tela de Casos, 20 por página (decisão #30). */
export async function buscarCasos(session: ConectorSession, input: BuscarCasosInput) {
  const filtros: FiltrosBuscaCasos = {
    texto: s(input.texto),
    produto_id: s(input.produto_id),
    modulo: s(input.modulo),
    projeto_id: s(input.projeto_id),
    setor: s(input.setor),
    tipo_abertura: input.tipo,
    usuario_dev_id: s(input.dev_id),
    usuario_qa_id: s(input.qa_id),
    usuario_abertura_id: s(input.relator_id),
    data_abertura_inicio: s(input.aberto_de),
    data_abertura_final: s(input.aberto_ate),
    data_producao_inicio: s(input.producao_de),
    data_producao_fim: s(input.producao_ate),
    nao_planejado: input.nao_planejado,
    // Valores do pedido; status e versão são resolvidos pelos catálogos abaixo.
    versao_produto: s(input.versao),
    status_ids: (input.status ?? []).map(s).filter(Boolean),
  };
  const temStatus = (filtros.status_ids?.length ?? 0) > 0;
  if (!temFiltroBusca(filtros)) {
    return {
      erro: true,
      texto:
        "Informe pelo menos um filtro (texto, produto, status, dev, projeto, período...). Sem filtro a busca listaria a base inteira.",
    };
  }

  const cursor = decodificarCursor(input.cursor);
  if (s(input.cursor) && !cursor) {
    return { erro: true, texto: "Cursor inválido. Refaça a busca sem cursor para voltar à primeira página." };
  }

  return comTokenDaConexao(session.conexao, async (auth) => {
    if (temStatus) {
      const catalogo = await listarStatus(auth, input.tipo === "REPORT" ? "REPORT" : "CASO");
      const { ids, naoEncontrados } = resolverStatus(filtros.status_ids ?? [], catalogo);
      if (naoEncontrados.length) {
        return {
          erro: true,
          texto: `Status não reconhecido: ${naoEncontrados.join(", ")}. Status disponíveis: ${catalogo
            .map((o) => `${o.nome} (${o.id})`)
            .join(", ")}.`,
        };
      }
      filtros.status_ids = ids;
    }
    filtros.versao_produto = await versaoParaFiltro(auth, filtros.produto_id ?? "", s(input.versao));

    const r = await api.get("/projeto-memoria", {
      params: parametrosProjetoMemoria(filtros, {
        per_page: POR_PAGINA_BUSCA,
        cursor: cursor?.c,
      }),
      headers: auth,
    });
    const itens = (r.data?.data ?? []) as ProjetoMemoriaItem[];
    const total = Number(r.data?.totalizadores?.total_casos ?? itens.length);
    const pagina = cursor?.p ?? 1;
    const paginas = Math.max(1, Math.ceil(total / POR_PAGINA_BUSCA));
    const proximo = r.data?.pagination?.has_more ? s(r.data?.pagination?.next_cursor) : "";

    if (!itens.length) {
      return {
        erro: false,
        texto: [
          "Nenhum caso com esses filtros.",
          filtros.texto
            ? "O texto é buscado só no resumo do caso (contém, sem diferença de maiúsculas e acentos): tente outras palavras ou o nome da tela, do status ou da rotina."
            : "",
        ]
          .filter(Boolean)
          .join(" "),
      };
    }

    const linhas = [
      `${total} ${total === 1 ? "caso" : "casos"} (página ${pagina} de ${paginas}).`,
      ...itens.map(linhaCaso),
    ];
    if (proximo) {
      linhas.push(
        "",
        `Próxima página: chame softflow_buscar_casos de novo com os mesmos filtros e cursor "${codificarCursor(proximo, pagina + 1)}".`,
      );
    }
    return { erro: false, texto: linhas.join("\n") };
  });
}
