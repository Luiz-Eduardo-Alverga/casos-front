/**
 * Armazena estatísticas de abertura de casos por produto/versão para o fluxo de Preenchimento Rápido.
 */
const LS_KEY = "casos-reports-abertura-stats";
const SS_IGNORE_KEY = "reports-ignoreAutoFill";

export type AberturaStats = {
  produtoId: string;
  versao: string;
  contador: number;
};

export function getAberturaStats(): AberturaStats | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AberturaStats;
    if (
      typeof parsed.produtoId === "string" &&
      typeof parsed.versao === "string" &&
      typeof parsed.contador === "number"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setAberturaStats(stats: AberturaStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(stats));
}

export function clearAberturaStats(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_KEY);
}

/**
 * Incrementa ou inicia contador para o par produto+versão.
 * Retorna o novo contador e se deve exibir a modal de Preenchimento Rápido (3º caso: contador === 2 após incremento).
 */
export function incrementAberturaStats(
  produtoId: string,
  versao: string,
): { contador: number; shouldPromptQuickMode: boolean } {
  const prev = getAberturaStats();
  let contador: number;
  if (prev && prev.produtoId === produtoId && prev.versao === versao) {
    contador = prev.contador + 1;
  } else {
    contador = 1;
  }
  setAberturaStats({ produtoId, versao, contador });
  // Após 2 aberturas com o mesmo par, ao clicar Novo caso pela 2ª vez o contador vira 2 → inicia o 3º caso
  const shouldPromptQuickMode = contador === 2;
  return { contador, shouldPromptQuickMode };
}

export function getIgnoreAutoFill(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SS_IGNORE_KEY) === "true";
}

export function setIgnoreAutoFill(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) sessionStorage.setItem(SS_IGNORE_KEY, "true");
  else sessionStorage.removeItem(SS_IGNORE_KEY);
}
