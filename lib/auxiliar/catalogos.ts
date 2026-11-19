import { api } from "@/lib/axios";

/**
 * Chamadas dos catálogos auxiliares da API Soft Flow (`/auxiliar/*`), no servidor.
 * Usadas pelas rotas `app/api/auxiliar/*` (com o token do cookie) e pelo conector do
 * Claude (com o token da conexão). Erros da API (axios) são propagados.
 */

export type AuthorizationHeader = { Authorization: string };

export interface CatalogoResult {
  status: number;
  data: unknown;
}

async function getAuxiliar(
  authorizationHeader: AuthorizationHeader,
  path: string,
  params: Record<string, string | number | boolean | undefined>,
): Promise<CatalogoResult> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
  );
  const response = await api.get(`/auxiliar/${path}`, {
    params: cleanParams,
    headers: authorizationHeader,
  });
  return { status: response.status, data: response.data };
}

export function getProdutosCatalogo(
  auth: AuthorizationHeader,
  params: { search?: string } = {},
) {
  return getAuxiliar(auth, "produtos", { search: params.search });
}

export function getVersoesCatalogo(
  auth: AuthorizationHeader,
  params: { produto_id: string; search?: string; todas?: boolean },
) {
  return getAuxiliar(auth, "versoes", {
    produto_id: params.produto_id,
    todas: params.todas ?? false,
    search: params.search,
  });
}

export function getModulosCatalogo(
  auth: AuthorizationHeader,
  params: { produto_id: string; search?: string },
) {
  return getAuxiliar(auth, "modulos", {
    produto_id: params.produto_id,
    search: params.search,
  });
}

export function getProjetosCatalogo(
  auth: AuthorizationHeader,
  params: {
    usuario_id: string;
    setor_projeto?: string;
    numero_projeto?: string;
    search?: string;
  },
) {
  return getAuxiliar(auth, "projetos", params);
}

export function getUsuariosCatalogo(
  auth: AuthorizationHeader,
  params: { search?: string; somente_projetos?: boolean; projeto?: number } = {},
) {
  return getAuxiliar(auth, "usuarios", params);
}

export function getCategoriasCatalogo(
  auth: AuthorizationHeader,
  params: { search?: string } = {},
) {
  return getAuxiliar(auth, "categorias", { search: params.search });
}

export function getImportanciasCatalogo(
  auth: AuthorizationHeader,
  params: { tipo: string },
) {
  return getAuxiliar(auth, "importancias", { tipo: params.tipo });
}

export function getOrigensCatalogo(
  auth: AuthorizationHeader,
  params: { search?: string } = {},
) {
  return getAuxiliar(auth, "origens", { search: params.search });
}
