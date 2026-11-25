import {
  getCategoriasCatalogo,
  getImportanciasCatalogo,
  getModulosCatalogo,
  getOrigensCatalogo,
  getProdutosCatalogo,
  getProjetosCatalogo,
  getStatusCatalogo,
  getUsuariosCatalogo,
  getVersoesCatalogo,
  type AuthorizationHeader,
} from "@/lib/auxiliar/catalogos";

/** Opção normalizada de um catálogo: o que o Claude repete à pessoa. */
export interface Opcao {
  id: string;
  nome: string;
  detalhe?: string;
}

export const TIPOS_OPCAO = [
  "produto",
  "versao",
  "modulo",
  "projeto",
  "pessoa",
  "categoria",
  "importancia",
  "origem",
  "status",
] as const;

export type TipoOpcao = (typeof TIPOS_OPCAO)[number];

const DESCRICAO_PT: Record<string, string> = { Medio: "Médio", Critico: "Crítico" };

function lista(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  const inner = (data as { data?: unknown } | null)?.data;
  return Array.isArray(inner) ? (inner as Record<string, unknown>[]) : [];
}

const str = (v: unknown) => (v == null ? "" : String(v).trim());

/** Comparação sem acento e sem caixa. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export async function listarProdutos(auth: AuthorizationHeader, busca?: string) {
  const { data } = await getProdutosCatalogo(auth, { search: busca });
  return lista(data)
    .filter((p) => str(p.desativado) !== "1")
    .map((p) => ({ id: str(p.id), nome: str(p.nome_projeto), detalhe: str(p.setor), setor: str(p.setor) }));
}

export async function listarVersoes(auth: AuthorizationHeader, produtoId: string, busca?: string) {
  const { data } = await getVersoesCatalogo(auth, { produto_id: produtoId, search: busca });
  return lista(data).map((v) => ({ id: str(v.sequencia), nome: str(v.versao) }));
}

export async function listarModulos(auth: AuthorizationHeader, produtoId: string, busca?: string) {
  const { data } = await getModulosCatalogo(auth, { produto_id: produtoId, search: busca });
  return lista(data).map((m) => {
    const nome = typeof m === "string" ? m : str((m as { modulo?: unknown }).modulo ?? m);
    return { id: nome, nome };
  });
}

export async function listarProjetos(
  auth: AuthorizationHeader,
  usuarioId: number,
  params: { busca?: string; setor?: string } = {},
) {
  const { data } = await getProjetosCatalogo(auth, {
    usuario_id: String(usuarioId),
    setor_projeto: params.setor || undefined,
    search: params.busca,
  });
  return lista(data).map((p) => ({
    id: str(p.id),
    nome: str(p.nome_projeto),
    detalhe: [str(p.data_inicial).slice(0, 10), str(p.data_final).slice(0, 10)]
      .filter(Boolean)
      .join(" a "),
  }));
}

export async function listarPessoas(auth: AuthorizationHeader, busca?: string) {
  const { data } = await getUsuariosCatalogo(auth, { search: busca });
  return lista(data).map((u) => ({ id: str(u.id), nome: str(u.nome_suporte), detalhe: str(u.setor) }));
}

export async function listarCategorias(auth: AuthorizationHeader, busca?: string) {
  const { data } = await getCategoriasCatalogo(auth, { search: busca });
  return lista(data).map((c) => ({ id: str(c.id), nome: str(c.tipo_categoria) }));
}

export async function listarImportancias(auth: AuthorizationHeader) {
  const { data } = await getImportanciasCatalogo(auth, { tipo: "CASO" });
  return lista(data)
    .sort((a, b) => Number(a.nivel) - Number(b.nivel))
    .map((i) => {
      const tipo = str(i.TipoPrioridade);
      const desc = str(i.descricao);
      return { id: str(i.nivel), nome: tipo || DESCRICAO_PT[desc] || desc || str(i.Registro) };
    });
}

export async function listarOrigens(auth: AuthorizationHeader, busca?: string) {
  const { data } = await getOrigensCatalogo(auth, { search: busca });
  return lista(data).map((o) => ({ id: str(o.id), nome: str(o.nome) }));
}

/** Status ativos de caso (ou de report), como o filtro de status da tela de Casos. */
export async function listarStatus(auth: AuthorizationHeader, tipo: "CASO" | "REPORT" = "CASO") {
  const { data } = await getStatusCatalogo(auth);
  return lista(data)
    .filter((st) => str(st.tipo_status) === tipo && str(st.desativado) !== "1")
    .map((st) => ({ id: str(st.Registro), nome: str(st.descricao) || str(st.tipo) }));
}

/** Filtra por texto (sem acento/caixa) quando o legado não filtra. */
export function filtrarPorBusca<T extends Opcao>(itens: T[], busca?: string): T[] {
  const alvo = busca ? normalizar(busca) : "";
  if (!alvo) return itens;
  return itens.filter(
    (i) => normalizar(i.nome).includes(alvo) || i.id === busca?.trim(),
  );
}
