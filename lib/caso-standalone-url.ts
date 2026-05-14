/** Query usada quando o caso é aberto em nova aba: botão Voltar vira Fechar e tenta fechar a aba. */
export const CASO_STANDALONE_QUERY_KEY = "standalone";
export const CASO_STANDALONE_QUERY_VALUE = "1";

export function buildCasoHrefForNewTab(id: string | number): string {
  return `/casos/${id}?${CASO_STANDALONE_QUERY_KEY}=${CASO_STANDALONE_QUERY_VALUE}`;
}

/** Anexa `standalone=1` a um path `/casos/:id` (preserva query existente). */
export function appendStandaloneToCasoPath(path: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${CASO_STANDALONE_QUERY_KEY}=${CASO_STANDALONE_QUERY_VALUE}`;
}

export function isCasoStandaloneMode(searchParams: URLSearchParams): boolean {
  return searchParams.get(CASO_STANDALONE_QUERY_KEY) === CASO_STANDALONE_QUERY_VALUE;
}
