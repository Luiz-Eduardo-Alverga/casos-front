import type { ModuloFormData } from "@/components/produtos/edicao/modulos/modulo-form-schema";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import type {
  ProdutoModuloData,
  ProdutoModuloPayload,
} from "@/services/produtos/types";

export function moduloToFormValues(modulo: ProdutoModuloData): ModuloFormData {
  return {
    nome: modulo.NomeModulo ?? "",
    ordemImpressao:
      modulo.OrdemImpressao != null ? String(modulo.OrdemImpressao) : "",
  };
}

function parseOrdemImpressao(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return Number(trimmed);
}

export function buildCreateModuloPayload(
  data: ModuloFormData,
): ProdutoModuloPayload {
  return {
    NomeModulo: data.nome.trim().toUpperCase(),
    OrdemImpressao: parseOrdemImpressao(data.ordemImpressao),
    Nivel: 0,
    Parent_ID: null,
    Descricao: null,
    LocalArquivo: null,
    Versionado: true,
    Atualizador: false,
  };
}

export function buildUpdateModuloPayload(
  data: ModuloFormData,
  existing: ProdutoModuloData,
): ProdutoModuloPayload & { Registro: number } {
  return {
    Registro: existing.Registro,
    NomeModulo: data.nome.trim().toUpperCase(),
    OrdemImpressao: parseOrdemImpressao(data.ordemImpressao),
    Nivel: existing.Nivel,
    Parent_ID: existing.Parent_ID,
    Descricao: existing.Descricao,
    LocalArquivo: existing.LocalArquivo,
    Versionado: existing.Versionado,
    Atualizador: existing.Atualizador,
  };
}

export function formatOrdemImpressao(ordem: number | null): string {
  if (ordem == null) return PRODUTO_LABELS.semOrdem;
  return `${PRODUTO_LABELS.impressao} ${ordem}`;
}

export function sortModulos(itens: ProdutoModuloData[]): ProdutoModuloData[] {
  return [...itens].sort((a, b) => {
    const ordemA = a.OrdemImpressao;
    const ordemB = b.OrdemImpressao;
    if (ordemA == null && ordemB == null) {
      return a.NomeModulo.localeCompare(b.NomeModulo, "pt-BR");
    }
    if (ordemA == null) return 1;
    if (ordemB == null) return -1;
    if (ordemA !== ordemB) return ordemA - ordemB;
    return a.NomeModulo.localeCompare(b.NomeModulo, "pt-BR");
  });
}
