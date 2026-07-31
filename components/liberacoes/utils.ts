import type { Produto } from "@/services/auxiliar/produtos";

/** Parse de data da API (`YYYY-MM-DD` ou `YYYY-MM-DD HH:mm:ss`) para Date (parte civil, sem deslocamento de fuso). */
export function parseLiberacaoDate(value: string | null | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const datePart = value.trim().split(/\s+/)[0] ?? "";
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

/** Formata Date para string de data da API: `YYYY-MM-DD` (fuso America/Sao_Paulo). */
export function formatLiberacaoDateApi(date: Date | undefined | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Exibe data da API (`YYYY-MM-DD[ HH:mm:ss]`) como `DD/MM/YYYY`, ou "—" quando ausente. */
export function formatLiberacaoDateDisplay(value: string | null | undefined): string {
  const date = parseLiberacaoDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

/** Resolve o nome de exibição de um produto pelo id, a partir do catálogo `useProdutos`. */
export function resolveProdutoNome(
  produtoId: number | string | null | undefined,
  produtos: Produto[] | undefined,
): string {
  if (produtoId == null || produtoId === "") return "—";
  const found = produtos?.find((p) => String(p.id) === String(produtoId));
  return found?.nome_projeto?.trim() || `Produto ${produtoId}`;
}

/** Converte a lista de produtos do catálogo em opções para Combobox/Select. */
export function produtosToOptions(
  produtos: Produto[] | undefined,
): Array<{ value: string; label: string }> {
  if (!produtos?.length) return [];
  return produtos
    .filter((p) => String(p.desativado ?? "").trim() === "0")
    .map((p) => ({
      value: String(p.id),
      label: p.nome_projeto?.trim() || `Produto ${p.id}`,
    }));
}
