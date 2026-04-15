import type { ProdutoOrdem } from "@/services/projeto-dev/get-produtos-ordem";

export function parseVersaoFieldValue(rawValue: string): string {
  if (!rawValue) return "";
  return rawValue.split("-")[1]?.trim() || rawValue;
}

export function toSortableId(item: ProdutoOrdem): string {
  return String(item.id);
}

