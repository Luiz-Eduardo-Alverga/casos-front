import type { ComboboxOption } from "@/components/ui/combobox";
import type { Versao } from "@/services/auxiliar/versoes";
import { extractVersaoProduto } from "@/components/casos/shared/payload";

export function getVersoesQueryKey(
  produto_id: string,
  search = "",
  todas = false,
) {
  return ["versoes", produto_id ?? "", search ?? "", todas ?? false] as const;
}

function formatVersaoAberturaLabel(abertura: string): string {
  const raw = abertura.trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }
  return raw;
}

export interface EditVersaoFallbackParams {
  /** Texto da versão vinda do caso carregado (`produto.versao`). */
  versaoProduto?: string | null;
  /** Valor atual do campo `versao` no form. */
  formVersaoValue?: string | null;
  /** Produto do item carregado; fallback só aplica quando coincide com `formProdutoId`. */
  produtoId?: string | null;
  formProdutoId?: string | null;
}

function isVersaoRepresentadaNoCatalogo(
  value: string,
  catalog: Versao[],
): boolean {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || !catalog.length) return false;
  if (isSequenciaNoCatalogo(trimmed, catalog)) return true;
  if (catalog.some((v) => String(v.versao ?? "").trim() === trimmed)) {
    return true;
  }
  return Boolean(findSequenciaByVersaoProduto(catalog, trimmed));
}

/**
 * Inclui a versão do caso em edição no catálogo quando ela não está entre
 * as versões abertas (ex.: versão já fechada).
 */
export function mergeEditVersaoIntoCatalog(
  versoes: Versao[],
  params?: EditVersaoFallbackParams,
): Versao[] {
  const catalog = versoes ?? [];
  if (!params) return catalog;

  const formProduto = String(params.formProdutoId ?? "").trim();
  const expectedProduto = String(params.produtoId ?? "").trim();
  if (expectedProduto && formProduto && formProduto !== expectedProduto) {
    return catalog;
  }

  const formVal = String(params.formVersaoValue ?? "").trim();
  const editVer = String(params.versaoProduto ?? "").trim();

  if (formVal && isVersaoRepresentadaNoCatalogo(formVal, catalog)) {
    return catalog;
  }
  if (editVer && isVersaoRepresentadaNoCatalogo(editVer, catalog)) {
    return catalog;
  }

  const versaoText =
    editVer || (formVal ? extractVersaoProduto(formVal) : "") || formVal;
  if (!versaoText) return catalog;

  const sequencia = formVal || versaoText;
  const stub: Versao = {
    id: sequencia,
    sequencia,
    versao: versaoText,
    abertura: "",
    fechamento: "",
    testador_id: 0,
  };

  return [...catalog, stub];
}

/** Opções do combobox: value = sequencia (PK), label = versão (+ sufixo se duplicada). */
export function buildVersaoComboboxOptions(versoes: Versao[]): ComboboxOption[] {
  const rows = versoes
    .map((v) => {
      const seq = String(v.sequencia ?? "").trim();
      const ver = String(v.versao ?? "").trim();
      return { seq, ver, v };
    })
    .filter((row) => Boolean(row.seq));

  const verCount = new Map<string, number>();
  for (const { ver } of rows) {
    if (!ver) continue;
    verCount.set(ver, (verCount.get(ver) ?? 0) + 1);
  }

  return rows.map(({ seq, ver, v }) => {
    const baseLabel = ver || seq;
    const duplicate = ver ? (verCount.get(ver) ?? 0) > 1 : false;
    let label = baseLabel;
    if (duplicate && ver) {
      const abertura = v.abertura?.trim();
      label = abertura
        ? `${ver} (${formatVersaoAberturaLabel(abertura)})`
        : `${ver} (#${seq})`;
    }
    return { value: seq, label };
  });
}

export function buildVersaoComboboxOptionsWithEditFallback(
  versoes: Versao[],
  params?: EditVersaoFallbackParams,
): ComboboxOption[] {
  return buildVersaoComboboxOptions(mergeEditVersaoIntoCatalog(versoes, params));
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
