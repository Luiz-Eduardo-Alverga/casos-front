export const produtosKeys = {
  all: ["produtos"] as const,
  list: (filters?: unknown) => ["produtos", filters] as const,
  infinite: (filters?: unknown) => ["produtos", "infinite", filters] as const,
  detail: (id: number | string) => ["produto", String(id)] as const,
  versoes: (id: number | string) => ["produto-versoes", String(id)] as const,
  versoesInfinite: (id: number | string) =>
    ["produto-versoes", String(id), "infinite"] as const,
  modulos: (id: number | string) => ["produto-modulos", String(id)] as const,
  modulosInfinite: (id: number | string) =>
    ["produto-modulos", String(id), "infinite"] as const,
  checklist: (id: number | string) =>
    ["produto-checklist", String(id)] as const,
  scripts: (id: number | string) => ["produto-scripts", String(id)] as const,
  scriptsInfinite: (id: number | string) =>
    ["produto-scripts", String(id), "infinite"] as const,
};
