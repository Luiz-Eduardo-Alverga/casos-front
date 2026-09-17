import { formatSgpDateTimeToPt } from "@/components/projetos/utils";

export function formatProdutoData(value: string | null | undefined): string {
  return formatSgpDateTimeToPt(value);
}

/** Legado usa 0 = não e valores ≠ 0 (ex.: -1) = sim. */
export function isVacaLeiteira(value: number | null | undefined): boolean {
  return value != null && Number(value) !== 0;
}

export function produtoIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length >= 2) {
    const first = partes[0]?.[0] ?? "";
    const last = partes[partes.length - 1]?.[0] ?? "";
    return `${first}${last}`.toUpperCase();
  }
  return nome.trim().slice(0, 2).toUpperCase() || "?";
}
