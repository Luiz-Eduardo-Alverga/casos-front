import { api } from "@/lib/axios";
import {
  getCachedProdutosList,
  getCachedProjetosList,
  type AuxiliarProdutoRow,
  type AuxiliarProjetoRow,
} from "@/lib/discord/auxiliar-labels-cache";

type AuthHeaders = { Authorization: string };

async function fetchProdutos(
  authHeaders: AuthHeaders,
): Promise<AuxiliarProdutoRow[]> {
  const response = await api.get<AuxiliarProdutoRow[]>("/auxiliar/produtos", {
    headers: authHeaders,
  });
  return Array.isArray(response.data) ? response.data : [];
}

async function fetchProjetos(
  authHeaders: AuthHeaders,
  usuarioId: string | number,
  numeroProjeto?: number,
): Promise<AuxiliarProjetoRow[]> {
  const response = await api.get<AuxiliarProjetoRow[]>("/auxiliar/projetos", {
    params: {
      usuario_id: String(usuarioId),
      ...(numeroProjeto != null
        ? { numero_projeto: numeroProjeto }
        : {}),
    },
    headers: authHeaders,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export function formatProdutoLabel(
  produtoId: number | undefined,
  nome: string | null,
): string {
  if (nome?.trim()) return nome.trim();
  if (produtoId != null && produtoId > 0) return `Produto ${produtoId}`;
  return "—";
}

export function formatProjetoLabel(
  cronogramaId: number | undefined,
  nome: string | null,
): string {
  if (cronogramaId != null && nome?.trim()) {
    return `${cronogramaId} - ${nome.trim()}`;
  }
  if (nome?.trim()) return nome.trim();
  if (cronogramaId != null && cronogramaId > 0) return String(cronogramaId);
  return "—";
}

export function formatVersaoLabel(versao: string | undefined | null): string {
  const v = String(versao ?? "").trim();
  return v || "—";
}

export async function resolveCasoLabels(
  authHeaders: AuthHeaders,
  ids: {
    produtoId?: number;
    cronogramaId?: number;
    usuarioIdForProjetos?: string | number | null;
  },
): Promise<{ produtoNome: string | null; projetoNome: string | null }> {
  const authKey = authHeaders.Authorization;
  let produtoNome: string | null = null;
  let projetoNome: string | null = null;

  if (ids.produtoId != null && ids.produtoId > 0) {
    const produtos = await getCachedProdutosList(authKey, () =>
      fetchProdutos(authHeaders),
    );
    const found = produtos.find((p) => Number(p.id) === ids.produtoId);
    produtoNome = found?.nome_projeto?.trim() || null;
  }

  const usuarioId =
    ids.usuarioIdForProjetos != null &&
    String(ids.usuarioIdForProjetos).trim() !== ""
      ? ids.usuarioIdForProjetos
      : null;

  if (ids.cronogramaId != null && ids.cronogramaId > 0 && usuarioId != null) {
    const projetosKey = `${authKey}:u${usuarioId}:p${ids.cronogramaId}`;
    const projetos = await getCachedProjetosList(projetosKey, () =>
      fetchProjetos(authHeaders, usuarioId, ids.cronogramaId),
    );
    const found = projetos.find(
      (p) => String(p.id) === String(ids.cronogramaId),
    );
    projetoNome = found?.nome_projeto?.trim() || null;

    if (!projetoNome) {
      const allKey = `${authKey}:u${usuarioId}:all`;
      const all = await getCachedProjetosList(allKey, () =>
        fetchProjetos(authHeaders, usuarioId),
      );
      const fromAll = all.find(
        (p) => String(p.id) === String(ids.cronogramaId),
      );
      projetoNome = fromAll?.nome_projeto?.trim() || null;
    }
  }

  return { produtoNome, projetoNome };
}
