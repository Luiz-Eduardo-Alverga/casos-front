import type { ScriptFormData } from "@/components/produtos/edicao/scripts/script-form-schema";
import type {
  ProdutoScriptData,
  ProdutoScriptPayload,
} from "@/services/produtos/types";

export function scriptToFormValues(script: ProdutoScriptData): ScriptFormData {
  return {
    titulo: script.descricao ?? "",
    ordem: script.ordenador != null ? String(script.ordenador) : "",
    procedimento: normalizeScriptText(script.procedimento),
  };
}

function parseOrdenador(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return Number(trimmed);
}

export function buildCreateScriptPayload(
  data: ScriptFormData,
): ProdutoScriptPayload {
  return {
    descricao: data.titulo.trim(),
    procedimento: data.procedimento.trim(),
    ordenador: parseOrdenador(data.ordem),
  };
}

export function buildUpdateScriptPayload(
  data: ScriptFormData,
  existing: ProdutoScriptData,
): ProdutoScriptPayload {
  return {
    projetoVersoes_id: existing.projetoVersoes_id,
    descricao: data.titulo.trim(),
    procedimento: data.procedimento.trim(),
    ordenador: parseOrdenador(data.ordem),
  };
}

export function normalizeScriptText(value: string | null | undefined): string {
  return (value ?? "").replace(/\r\n/g, "\n");
}

export function sortScripts(itens: ProdutoScriptData[]): ProdutoScriptData[] {
  return [...itens].sort((a, b) => {
    const ordemA = a.ordenador;
    const ordemB = b.ordenador;
    if (ordemA == null && ordemB == null) {
      return a.descricao.localeCompare(b.descricao, "pt-BR");
    }
    if (ordemA == null) return 1;
    if (ordemB == null) return -1;
    if (ordemA !== ordemB) return ordemA - ordemB;
    return a.descricao.localeCompare(b.descricao, "pt-BR");
  });
}

export function isFirstUnorderedScript(
  itens: ProdutoScriptData[],
  index: number,
): boolean {
  const firstUnordered = itens.findIndex((item) => item.ordenador == null);
  return firstUnordered > 0 && index === firstUnordered;
}
