/** Vínculo retornado pela API externa GET /sgp-usuarios/projeto/{registro} */
export interface SgpUsuarioProjetoRaw {
  sequencia: number;
  registro: number;
  usuario: number;
}

/** Item enriquecido com dados do catálogo auxiliar/usuarios */
export interface SgpUsuarioProjetoItem {
  sequencia: number;
  registro: number;
  usuario: number;
  nome: string | null;
  setor: string | null;
}

export interface SgpUsuarioProjetoPagination {
  per_page: number;
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
}

/** Resposta GET /api/sgp-usuarios/projeto/{projetoId} (enriquecida no servidor) */
export interface SgpUsuariosByProjetoResponse {
  success: boolean;
  data: SgpUsuarioProjetoItem[];
  pagination: SgpUsuarioProjetoPagination;
}
