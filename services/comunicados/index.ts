import { requestJson } from "./request";
import type {
  ComunicadoFiltros,
  ComunicadoFiltrosResponse,
  CriarComunicadoPayload,
  CriarComunicadoResponse,
  UsuarioComunicado,
  UsuariosComunicadoResponse,
} from "./types";

export async function getComunicadoFiltros(): Promise<ComunicadoFiltros> {
  const body = await requestJson<ComunicadoFiltrosResponse>(
    "/api/auxiliar/comunicado-filtros",
    "Erro ao carregar os filtros de destinatários",
  );
  return {
    pdv: body.data?.pdv ?? [],
    setor: body.data?.setor ?? [],
    nivel: body.data?.nivel ?? [],
    funcao: body.data?.funcao ?? [],
  };
}

export async function getUsuariosComunicado(
  filtros: ComunicadoFiltros,
): Promise<UsuarioComunicado[]> {
  const body = await requestJson<UsuariosComunicadoResponse>(
    "/api/auxiliar/usuarios-comunicado",
    "Erro ao carregar os usuários",
    { method: "POST", body: JSON.stringify(filtros) },
  );
  return Array.isArray(body.data) ? body.data : [];
}

export async function criarComunicado(
  payload: CriarComunicadoPayload,
): Promise<CriarComunicadoResponse> {
  return requestJson<CriarComunicadoResponse>(
    "/api/comunicados",
    "Erro ao enviar o aviso",
    { method: "POST", body: JSON.stringify(payload) },
  );
}
