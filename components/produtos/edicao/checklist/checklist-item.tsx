"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProdutoPessoaChip } from "@/components/produtos/tabela/produto-pessoa-chip";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { colaboradorLabelById } from "@/components/produtos/cadastro/utils";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/auth";
import type { Usuario } from "@/services/auxiliar/usuarios";
import type { ProdutoChecklistData } from "@/services/produtos/types";

export interface ChecklistItemProps {
  item: ProdutoChecklistData;
  posicao: number;
  canEdit: boolean;
  canDelete: boolean;
  usuarios?: Usuario[];
  currentUser?: User | null;
  onEdit: (item: ProdutoChecklistData) => void;
  onDelete: (item: ProdutoChecklistData) => void;
}

export function ChecklistItem({
  item,
  posicao,
  canEdit,
  canDelete,
  usuarios,
  currentUser,
  onEdit,
  onDelete,
}: ChecklistItemProps) {
  const showActions = canEdit || canDelete;
  const responsavelNome = colaboradorLabelById(
    item.id_responsavel,
    usuarios,
    currentUser,
  );

  return (
    <div className="group flex items-center gap-2 border-b border-border-divider px-4 py-4 hover:bg-muted/30">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
        {posicao}
      </span>
      <p className="min-w-0 flex-1 text-sm text-foreground text-pretty">
        {item.DescricaoItem}
      </p>
      <div className="shrink-0">
        <ProdutoPessoaChip nome={responsavelNome} />
      </div>
      {showActions ? (
        <div
          className={cn(
            "flex shrink-0 items-center gap-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100",
          )}
        >
          {canEdit ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              aria-label={PRODUTO_LABELS.editar}
              onClick={() => onEdit(item)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              aria-label={PRODUTO_LABELS.excluir}
              onClick={() => onDelete(item)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
