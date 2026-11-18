import type {
  ComunicadoFiltros,
  CriarComunicadoPayload,
  UsuarioComunicado,
} from "@/services/comunicados/types";
import type { Destinatario, ModoDestinatarios } from "./novo-aviso.types";

const GRUPOS = ["pdv", "setor", "nivel", "funcao"] as const;

/** A API devolve a função numérica nos usuários (1 = LIDER, 0 = OPERACIONAL). */
export function nomeFuncao(funcao: number | string): string {
  if (funcao === 1 || funcao === "1") return "LIDER";
  if (funcao === 0 || funcao === "0") return "OPERACIONAL";
  return String(funcao);
}

export function temFiltro(filtros: ComunicadoFiltros): boolean {
  return GRUPOS.some((g) => filtros[g].length > 0);
}

/**
 * Filtros como a API espera (decisão #4): grupo sem seleção vai com todos os valores;
 * no modo Todos, os quatro grupos vão com todos os valores.
 */
export function montarFiltrosPayload(
  modo: ModoDestinatarios,
  selecionados: ComunicadoFiltros,
  opcoes: ComunicadoFiltros,
): ComunicadoFiltros {
  const out = {} as ComunicadoFiltros;
  for (const g of GRUPOS) {
    out[g] =
      modo === "filtrar" && selecionados[g].length > 0
        ? selecionados[g]
        : opcoes[g];
  }
  return out;
}

/** Texto do gatilho do multi-select: "Todos", o valor único ou "VALOR +N". */
export function resumoFiltro(valores: string[]): string {
  if (valores.length === 0) return "Todos";
  if (valores.length === 1) return valores[0];
  return `${valores[0]} +${valores.length - 1}`;
}

/** Usuários base (filtro ou empresa) + adicionados, sem duplicar; adicionados vêm primeiro. */
export function montarListaDestinatarios(
  base: UsuarioComunicado[],
  extras: UsuarioComunicado[],
): Destinatario[] {
  const vistos = new Set<number>();
  const lista: Destinatario[] = [];
  for (const u of extras) {
    if (vistos.has(u.registro)) continue;
    vistos.add(u.registro);
    lista.push({ ...u, adicionado: true });
  }
  for (const u of base) {
    if (vistos.has(u.registro)) continue;
    vistos.add(u.registro);
    lista.push({ ...u, adicionado: false });
  }
  return lista;
}

export function idsSelecionados(
  lista: Destinatario[],
  excluidos: number[],
): number[] {
  const fora = new Set(excluidos);
  return lista.map((u) => u.registro).filter((id) => !fora.has(id));
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function filtrarPorNome<T extends UsuarioComunicado>(
  lista: T[],
  busca: string,
): T[] {
  const q = normalizar(busca);
  if (!q) return lista;
  return lista.filter((u) => normalizar(u.nome_suporte).includes(q));
}

/** Busca de "Adicionar usuário": nome ou registro, até `limite` sugestões. */
export function buscarUsuarios(
  lista: UsuarioComunicado[],
  busca: string,
  limite = 8,
): UsuarioComunicado[] {
  const q = normalizar(busca);
  if (!q) return [];
  return lista
    .filter(
      (u) =>
        normalizar(u.nome_suporte).includes(q) || String(u.registro).includes(q),
    )
    .slice(0, limite);
}

export function iniciais(nome: string): string {
  const partes = nome.replace(/[^\p{L}\s]/gu, "").trim().split(/\s+/);
  const letras =
    partes.length > 1
      ? `${partes[0][0] ?? ""}${partes[partes.length - 1][0] ?? ""}`
      : (partes[0] ?? "").slice(0, 2);
  return letras.toUpperCase() || "?";
}

export function descricaoUsuario(u: UsuarioComunicado): string {
  return [u.pdv, u.setor, u.nivel].filter(Boolean).join(" · ");
}

export function rotuloDestinatarios(n: number): string {
  if (n === 0) return "Nenhum destinatário";
  return n === 1 ? "1 destinatário" : `${n} destinatários`;
}

export function montarPayload(params: {
  titulo: string;
  descricao: string;
  auto: boolean;
  filtros: ComunicadoFiltros;
  suporteIds: number[];
}): CriarComunicadoPayload {
  return {
    titulo: params.titulo.trim(),
    descricao: params.descricao.trim(),
    ...params.filtros,
    suporte_ids: params.suporteIds,
    auto: params.auto,
    enviado: true, // decisão #13: sem rascunho nesta entrega
  };
}
