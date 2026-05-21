import type { AxiosInstance } from "axios";
import type {
  SgpUsuarioProjetoItem,
  SgpUsuarioProjetoRaw,
} from "@/interfaces/sgp-usuario-projeto";
import type { Usuario } from "@/services/auxiliar/usuarios";

export interface UsuarioCatalogEntry {
  id: number;
  nome: string;
  setor: string;
}

function normalizeUsuariosList(raw: unknown): Usuario[] {
  if (Array.isArray(raw)) return raw as Usuario[];
  if (
    raw &&
    typeof raw === "object" &&
    Array.isArray((raw as { data?: unknown }).data)
  ) {
    return (raw as { data: Usuario[] }).data;
  }
  return [];
}

export function buildUsuariosCatalogMap(
  usuarios: Usuario[],
): Map<number, UsuarioCatalogEntry> {
  const map = new Map<number, UsuarioCatalogEntry>();
  for (const item of usuarios) {
    const id = Number(item.id);
    if (!Number.isFinite(id)) continue;
    map.set(id, {
      id,
      nome: item.nome_suporte?.trim() ?? "",
      setor: item.setor?.trim() ?? "",
    });
  }
  return map;
}

export async function fetchUsuariosCatalogMap(
  apiClient: AxiosInstance,
  authHeaders: Record<string, string>,
): Promise<Map<number, UsuarioCatalogEntry>> {
  const response = await apiClient.get("/auxiliar/usuarios", {
    params: { somente_projetos: false },
    headers: authHeaders,
  });
  const usuarios = normalizeUsuariosList(response.data);
  return buildUsuariosCatalogMap(usuarios);
}

export function enrichSgpUsuariosProjeto(
  items: SgpUsuarioProjetoRaw[],
  catalog: Map<number, UsuarioCatalogEntry>,
): SgpUsuarioProjetoItem[] {
  return items.map((item) => {
    const entry = catalog.get(item.usuario);
    return {
      sequencia: item.sequencia,
      registro: item.registro,
      usuario: item.usuario,
      nome: entry?.nome ?? null,
      setor: entry?.setor ?? null,
    };
  });
}
