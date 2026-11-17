/** Query usada quando o produto é aberto em nova aba: botão Voltar vira Fechar e tenta fechar a aba. */
export const PRODUTO_STANDALONE_QUERY_KEY = "standalone";
export const PRODUTO_STANDALONE_QUERY_VALUE = "1";

export function buildProdutoHrefForNewTab(registro: string | number): string {
  return `/produtos/${registro}?${PRODUTO_STANDALONE_QUERY_KEY}=${PRODUTO_STANDALONE_QUERY_VALUE}`;
}

export function isProdutoStandaloneMode(
  searchParams: Pick<URLSearchParams, "get">,
): boolean {
  return (
    searchParams.get(PRODUTO_STANDALONE_QUERY_KEY) ===
    PRODUTO_STANDALONE_QUERY_VALUE
  );
}
