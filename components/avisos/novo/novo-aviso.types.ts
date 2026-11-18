import type {
  ComunicadoFiltroGrupo,
  ComunicadoFiltros,
  UsuarioComunicado,
} from "@/services/comunicados/types";

export type ModoDestinatarios = "todos" | "filtrar";

/** Usuário na lista de destinatários; `adicionado` = veio de "Adicionar usuário específico". */
export interface Destinatario extends UsuarioComunicado {
  adicionado: boolean;
}

export const GRUPOS_FILTRO: { grupo: ComunicadoFiltroGrupo; label: string }[] = [
  { grupo: "pdv", label: "PDV" },
  { grupo: "setor", label: "Setor" },
  { grupo: "nivel", label: "Nível" },
  { grupo: "funcao", label: "Função" },
];

export const FILTROS_VAZIOS: ComunicadoFiltros = {
  pdv: [],
  setor: [],
  nivel: [],
  funcao: [],
};
