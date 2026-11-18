/** Grupos de filtro de destinatários aceitos pela API Soft Flow. */
export type ComunicadoFiltroGrupo = "pdv" | "setor" | "nivel" | "funcao";

export type ComunicadoFiltros = Record<ComunicadoFiltroGrupo, string[]>;

export interface ComunicadoFiltrosResponse {
  success: boolean;
  data: ComunicadoFiltros;
}

export interface UsuarioComunicado {
  registro: number;
  nome_suporte: string;
  pdv: string;
  setor: string;
  nivel: string;
  /**
   * Na API de teste (2026-11-18) vem numérico: 1 = LIDER, 0 = OPERACIONAL (inferido filtrando
   * por cada nome). Usar `nomeFuncao` (utils da tela) para exibir.
   */
  funcao: number | string;
}

export interface UsuariosComunicadoResponse {
  success: boolean;
  data: UsuarioComunicado[];
  total: number;
}

export interface CriarComunicadoPayload extends ComunicadoFiltros {
  titulo: string;
  descricao: string;
  suporte_ids: number[];
  auto: boolean;
  enviado: boolean;
}

export interface ComunicadoCriado {
  id: number;
  titulo: string;
  descricao: string;
  enviado_por: string;
  enviado: boolean;
  total_destinatarios: number;
  usuarios: {
    suporte_id: number;
    lido: boolean;
    auto: boolean;
    data_lido: string | null;
  }[];
}

export interface CriarComunicadoResponse {
  success: boolean;
  message: string;
  data: ComunicadoCriado;
}
