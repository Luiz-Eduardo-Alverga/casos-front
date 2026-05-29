import { api } from "@/lib/axios";
import {
  resolveCasoLabels,
  formatProdutoLabel,
  formatProjetoLabel,
} from "@/lib/discord/resolve-caso-labels";
import { getCachedUsuarios } from "@/lib/discord/usuarios-cache";
import type {
  AuxiliarUsuarioDiscord,
  CasoDiscordNotifyInput,
} from "@/lib/discord/types";

type AuthHeaders = { Authorization: string };

async function fetchUsuariosFromApi(
  authHeaders: AuthHeaders,
): Promise<AuxiliarUsuarioDiscord[]> {
  const response = await api.get<AuxiliarUsuarioDiscord[]>("/auxiliar/usuarios", {
    params: { somente_projetos: true },
    headers: authHeaders,
  });
  return Array.isArray(response.data) ? response.data : [];
}

function firstNameFromNome(nome: string | null): string | null {
  if (!nome?.trim()) return null;
  const part = nome.trim().split(/\s+/)[0];
  return part || nome.trim();
}

export async function fetchNotifyContext(
  authHeaders: AuthHeaders,
  input: CasoDiscordNotifyInput,
) {
  const cacheKey = authHeaders.Authorization;
  const usuarios = await getCachedUsuarios(cacheKey, () =>
    fetchUsuariosFromApi(authHeaders),
  );

  const atribuidoId = String(input.atribuidoPara);
  const dev = usuarios.find((u) => String(u.id) === atribuidoId);

  let abertoPor: string | null = null;
  const aberturaId = input.aberturaUsuarioId;
  if (aberturaId != null && String(aberturaId).trim() !== "") {
    const abertura = usuarios.find((u) => String(u.id) === String(aberturaId));
    abertoPor = firstNameFromNome(abertura?.nome_suporte ?? null);
  }

  const usuarioIdForProjetos =
    aberturaId != null && String(aberturaId).trim() !== ""
      ? aberturaId
      : input.atribuidoPara;

  const { produtoNome, projetoNome } = await resolveCasoLabels(authHeaders, {
    produtoId: input.produtoId,
    cronogramaId: input.cronogramaId,
    usuarioIdForProjetos,
  });

  return {
    usuarioDiscord: dev?.usuario_discord?.trim() || null,
    produtoLabel: formatProdutoLabel(input.produtoId, produtoNome),
    projetoLabel: formatProjetoLabel(input.cronogramaId, projetoNome),
    abertoPor,
  };
}
