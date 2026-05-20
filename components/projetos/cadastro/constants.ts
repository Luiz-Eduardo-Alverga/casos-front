/** Valores fixos enviados na API (não exibidos no formulário). Validar com negócio. */
export const SGP_PROJETO_HIDDEN_DEFAULTS = {
  Cliente: 293,
  PDV: "JOAO PESSOA",
  ClasseProjeto: "ESTRATEGICO",
} as const;

export const TIPO_PROJETO_OPTIONS = [
  { value: "CAMPANHA", label: "Campanha" },
  { value: "COMERCIAL", label: "Comercial" },
  { value: "ESTRATEGIA", label: "Estratégia" },
  { value: "MARKETING", label: "Marketing" },
  { value: "PROJETO", label: "Projeto" },
  { value: "ADMINISTRACAO", label: "Administração" },
  { value: "RAPID", label: "Rapid" },
] as const;

export const STATUS_PROJETO_OPTIONS = [
  { value: "ABERTO", label: "Aberto" },
  { value: "FECHADO", label: "Fechado" },
] as const;

export const DEFAULT_TIPO_PROJETO = "PROJETO";
export const DEFAULT_STATUS_PROJETO = "ABERTO";
