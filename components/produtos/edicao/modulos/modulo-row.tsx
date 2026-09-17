"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { formatOrdemImpressao } from "@/components/produtos/edicao/modulos/modulo-form-utils";
import { cn } from "@/lib/utils";
import type { ProdutoModuloData } from "@/services/produtos/types";

export interface ModuloRowProps {
  modulo: ProdutoModuloData;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (modulo: ProdutoModuloData) => void;
  onDelete: (modulo: ProdutoModuloData) => void;
}

function ModuloFlagPills({ modulo }: { modulo: ProdutoModuloData }) {
  return (
    <>
      {modulo.Versionado ? (
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
          {PRODUTO_LABELS.versionado}
        </span>
      ) : null}
      {modulo.Atualizador ? (
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
          {PRODUTO_LABELS.atualizador}
        </span>
      ) : null}
    </>
  );
}

function ModuloAcoesMenu({
  modulo,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: ModuloRowProps) {
  if (!canEdit && !canDelete) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          aria-label={PRODUTO_LABELS.acoesMenu}
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(event) => event.stopPropagation()}
      >
        {canEdit ? (
          <DropdownMenuItem className="gap-2" onClick={() => onEdit(modulo)}>
            <Pencil className="h-4 w-4" />
            {PRODUTO_LABELS.editar}
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <DropdownMenuItem
            className="gap-2 text-destructive focus:text-destructive"
            onClick={() => onDelete(modulo)}
          >
            <Trash2 className="h-4 w-4" />
            {PRODUTO_LABELS.excluir}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ModuloRow({
  modulo,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: ModuloRowProps) {
  const clickable = canEdit;

  return (
    <div
      className={cn(
        "flex items-center gap-4 border-b border-border-divider px-4 py-4",
        clickable && "cursor-pointer hover:bg-muted/30",
      )}
      onClick={clickable ? () => onEdit(modulo) : undefined}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <span className="text-sm font-semibold tracking-wide text-foreground">
          {modulo.NomeModulo}
        </span>
        <ModuloFlagPills modulo={modulo} />
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {formatOrdemImpressao(modulo.OrdemImpressao)}
      </span>
      <ModuloAcoesMenu
        modulo={modulo}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
