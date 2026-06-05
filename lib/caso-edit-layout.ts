import {
  appendStandaloneToCasoPath,
  CASO_STANDALONE_QUERY_KEY,
  CASO_STANDALONE_QUERY_VALUE,
} from "@/lib/caso-standalone-url";

export const CASO_EDIT_LAYOUT_QUERY_KEY = "layout";

export type CasoEditLayout = "case" | "report";

export function buildCasoEditHref(
  id: string | number,
  layout: CasoEditLayout,
  options?: { standalone?: boolean },
): string {
  const params = new URLSearchParams();
  params.set(CASO_EDIT_LAYOUT_QUERY_KEY, layout);

  if (options?.standalone) {
    params.set(CASO_STANDALONE_QUERY_KEY, CASO_STANDALONE_QUERY_VALUE);
  }

  return `/casos/${id}?${params.toString()}`;
}

/** Define `layout` preservando demais query params da URL atual. */
export function buildCasoEditHrefWithLayout(
  id: string | number,
  layout: CasoEditLayout,
  searchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(searchParams.toString());
  params.set(CASO_EDIT_LAYOUT_QUERY_KEY, layout);
  const query = params.toString();
  return query ? `/casos/${id}?${query}` : `/casos/${id}`;
}

export function parseCasoEditLayout(
  searchParams: URLSearchParams,
): CasoEditLayout | null {
  const value = searchParams.get(CASO_EDIT_LAYOUT_QUERY_KEY)?.trim().toLowerCase();
  if (value === "case" || value === "report") return value;
  return null;
}

/** Anexa `layout=case|report` a um path `/casos/:id` (preserva query existente). */
export function appendLayoutToCasoPath(
  path: string,
  layout: CasoEditLayout,
): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${CASO_EDIT_LAYOUT_QUERY_KEY}=${layout}`;
}

export { appendStandaloneToCasoPath };
