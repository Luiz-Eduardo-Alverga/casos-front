export const STATUS_LIBERACAO_OPTIONS = [
  { value: "ABERTO", label: "Aberto" },
  { value: "FECHADO", label: "Fechado" },
] as const;

export const TIPO_LIBERACAO_OPTIONS = [
  { value: "COMPLETA", label: "Completa" },
  { value: "EMERGENCIA", label: "Emergência" },
] as const;

export const DEFAULT_STATUS_LIBERACAO = "ABERTO";
export const DEFAULT_TIPO_LIBERACAO = "COMPLETA";
