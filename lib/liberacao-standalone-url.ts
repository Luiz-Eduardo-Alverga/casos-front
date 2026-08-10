/** Query usada quando a liberação é aberta em nova aba: botão Voltar vira Fechar e tenta fechar a aba. */
export const LIBERACAO_STANDALONE_QUERY_KEY = "standalone";
export const LIBERACAO_STANDALONE_QUERY_VALUE = "1";

export function buildLiberacaoHrefForNewTab(
  registro: string | number,
): string {
  return `/liberacoes/${registro}?${LIBERACAO_STANDALONE_QUERY_KEY}=${LIBERACAO_STANDALONE_QUERY_VALUE}`;
}

/** Anexa `standalone=1` a um path `/liberacoes/:registro` (preserva query existente). */
export function appendStandaloneToLiberacaoPath(path: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${LIBERACAO_STANDALONE_QUERY_KEY}=${LIBERACAO_STANDALONE_QUERY_VALUE}`;
}

export function isLiberacaoStandaloneMode(
  searchParams: URLSearchParams,
): boolean {
  return (
    searchParams.get(LIBERACAO_STANDALONE_QUERY_KEY) ===
    LIBERACAO_STANDALONE_QUERY_VALUE
  );
}
