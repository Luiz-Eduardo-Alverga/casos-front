import { parseOptionalId } from "@/components/produtos/cadastro/utils";
import type { ComboboxOption } from "@/components/ui/combobox";
import type { User } from "@/lib/auth";
import type { Usuario } from "@/services/auxiliar/usuarios";
import type {
  ProdutoChecklistData,
  ProdutoChecklistPayload,
} from "@/services/produtos/types";

export function sortChecklist(
  itens: ProdutoChecklistData[],
): ProdutoChecklistData[] {
  return [...itens].sort((a, b) => {
    if (a.Ordenacao !== b.Ordenacao) return a.Ordenacao - b.Ordenacao;
    return a.ID - b.ID;
  });
}

export function nextOrdenacao(itens: ProdutoChecklistData[]): number {
  if (itens.length === 0) return 1;
  return Math.max(...itens.map((item) => item.Ordenacao)) + 1;
}

export function buildCreateChecklistPayload(
  descricao: string,
  responsavelId: string | undefined,
  ordenacao: number,
): ProdutoChecklistPayload {
  return {
    DescricaoItem: descricao.trim(),
    Ordenacao: ordenacao,
    id_responsavel: parseOptionalId(responsavelId),
  };
}

export function buildUpdateChecklistPayload(
  descricao: string,
  responsavelId: string | undefined,
  existing: ProdutoChecklistData,
): ProdutoChecklistPayload {
  return {
    Projeto_Versoes_ID: existing.Projeto_Versoes_ID,
    DescricaoItem: descricao.trim(),
    Ordenacao: existing.Ordenacao,
    id_responsavel: parseOptionalId(responsavelId),
  };
}

export function checklistResponsavelOptions(
  usuarios: Usuario[] | undefined,
  currentUser?: User | null,
  selected?: { id: string; label: string },
): ComboboxOption[] {
  const options: ComboboxOption[] = [];
  const seen = new Set<string>();

  if (currentUser) {
    const id = String(currentUser.id);
    options.push({ value: id, label: currentUser.nome });
    seen.add(id);
  }

  for (const usuario of usuarios ?? []) {
    if (seen.has(usuario.id)) continue;
    options.push({ value: usuario.id, label: usuario.nome_suporte });
    seen.add(usuario.id);
  }

  if (selected?.id && !seen.has(selected.id)) {
    options.unshift({ value: selected.id, label: selected.label });
  } else if (selected?.id && selected.label) {
    const index = options.findIndex((option) => option.value === selected.id);
    if (index >= 0) {
      options[index] = { value: selected.id, label: selected.label };
    }
  }

  return options;
}
