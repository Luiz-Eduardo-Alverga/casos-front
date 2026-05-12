import type { BulkUpdateCasosRequest } from "@/services/projeto-casos/bulk-update";
import type { CasosTransferenciaFormValues } from "./types";

export function parseVersaoSelecionada(value?: string): string | undefined {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return undefined;

  const parts = trimmed.split("-");
  if (parts.length >= 2) {
    const maybeVersao = parts[1]?.trim();
    if (maybeVersao) return maybeVersao;
  }

  return trimmed;
}

function toOptionalNumber(value?: string): number | undefined {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return undefined;

  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
}

export function buildBulkTransferPayload(
  ids: string[],
  formValues: CasosTransferenciaFormValues,
): BulkUpdateCasosRequest | null {
  const AtribuidoPara = toOptionalNumber(formValues.devAtribuido);
  const atribuido_qa = toOptionalNumber(formValues.qaAtribuido);
  const Prioridade = toOptionalNumber(formValues.importancia);
  const cronograma_id = toOptionalNumber(formValues.projeto);
  const VersaoProduto = parseVersaoSelecionada(formValues.versao);

  const payload: BulkUpdateCasosRequest = {
    ids,
    ...(AtribuidoPara != null ? { AtribuidoPara } : {}),
    ...(atribuido_qa != null ? { atribuido_qa } : {}),
    ...(Prioridade != null ? { Prioridade } : {}),
    ...(cronograma_id != null ? { cronograma_id } : {}),
    ...(VersaoProduto ? { VersaoProduto } : {}),
  };

  const hasChanges =
    payload.AtribuidoPara != null ||
    payload.atribuido_qa != null ||
    payload.Prioridade != null ||
    payload.cronograma_id != null ||
    Boolean(payload.VersaoProduto);

  if (!hasChanges) return null;
  return payload;
}
