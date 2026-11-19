/**
 * Helpers puros de versão de produto (sem React, sem `window`).
 * Usados pelo front (formulários e filtros) e pelo servidor (conector do Claude).
 */
import type { Versao } from "@/services/auxiliar/versoes";

/**
 * Extrai a "versão crua" do valor selecionado no combobox de versão
 * (ex.: "12-1.2.3" -> "1.2.3", "1.2.3" -> "1.2.3").
 */
export function extractVersaoProduto(
  versao: string | undefined | null,
): string {
  const raw = String(versao ?? "");
  if (!raw) return "";
  const parts = raw.split("-");
  if (parts.length > 1) {
    const cauda = parts.slice(1).join("-").trim();
    return cauda || raw;
  }
  return raw;
}

export function isSequenciaNoCatalogo(
  formValue: string,
  versoes: Versao[],
): boolean {
  const trimmed = String(formValue ?? "").trim();
  if (!trimmed) return false;
  return versoes.some((v) => String(v.sequencia ?? "").trim() === trimmed);
}

/**
 * Resolve texto de versão (memória/API) → sequencia do catálogo.
 * Se houver várias com o mesmo texto, retorna a primeira.
 */
export function findSequenciaByVersaoProduto(
  versoes: Versao[],
  versaoProduto: string,
): string | undefined {
  const alvo = String(versaoProduto ?? "").trim();
  if (!alvo || !versoes.length) return undefined;

  if (isSequenciaNoCatalogo(alvo, versoes)) return alvo;

  const byTexto = versoes.filter(
    (v) => String(v.versao ?? "").trim() === alvo,
  );
  if (byTexto.length > 0) {
    return String(byTexto[0].sequencia ?? "").trim() || undefined;
  }

  const legacy = extractVersaoProduto(alvo);
  if (legacy && legacy !== alvo) {
    return findSequenciaByVersaoProduto(versoes, legacy);
  }

  return undefined;
}

/**
 * Converte valor do form (sequencia) → VersaoProduto enviado à API.
 * Compatível com valores legados (texto puro ou formato seq-versao).
 */
export function resolveVersaoProdutoForApi(
  formValue: string,
  versoes?: Versao[] | null,
): string {
  const trimmed = String(formValue ?? "").trim();
  if (!trimmed) return "";

  if (versoes?.length) {
    const bySeq = versoes.find(
      (v) => String(v.sequencia ?? "").trim() === trimmed,
    );
    if (bySeq) return String(bySeq.versao ?? "").trim();
  }

  return extractVersaoProduto(trimmed);
}

export function findVersaoBySequencia(
  versoes: Versao[] | undefined | null,
  sequencia: string,
): Versao | undefined {
  const seq = String(sequencia ?? "").trim();
  if (!seq || !versoes?.length) return undefined;
  return versoes.find((v) => String(v.sequencia ?? "").trim() === seq);
}

/** Normaliza valor do form (texto legado ou sequencia) para sequencia do catálogo. */
export function resolveVersaoSequenciaForForm(
  formVersaoValue: string,
  versoes?: Versao[] | null,
): string {
  const trimmed = String(formVersaoValue ?? "").trim();
  if (!trimmed || !versoes?.length) return trimmed;
  if (isSequenciaNoCatalogo(trimmed, versoes)) return trimmed;
  return findSequenciaByVersaoProduto(versoes, trimmed) ?? trimmed;
}
