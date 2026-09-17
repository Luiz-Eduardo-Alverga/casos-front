"use client";

import { Lock, LockOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { isVersaoAberta } from "@/components/produtos/edicao/versoes/utils";
import type { ProdutoVersaoData } from "@/services/produtos/types";

export interface VersaoAcoesMenuProps {
  versao: ProdutoVersaoData;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (versao: ProdutoVersaoData) => void;
  onToggleStatus: (versao: ProdutoVersaoData) => void;
  onDelete: (versao: ProdutoVersaoData) => void;
}

export function VersaoAcoesMenu({
  versao,
  canEdit,
  canDelete,
  onEdit,
  onToggleStatus,
  onDelete,
}: VersaoAcoesMenuProps) {
  if (!canEdit && !canDelete) return null;
  const aberto = isVersaoAberta(versao.Status);

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
      <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
        {canEdit ? (
          <DropdownMenuItem className="gap-2" onClick={() => onEdit(versao)}>
            <Pencil className="h-4 w-4" />
            {PRODUTO_LABELS.editar}
          </DropdownMenuItem>
        ) : null}
        {canEdit ? (
          <DropdownMenuItem className="gap-2" onClick={() => onToggleStatus(versao)}>
            {aberto ? (
              <Lock className="h-4 w-4" />
            ) : (
              <LockOpen className="h-4 w-4" />
            )}
            {aberto
              ? PRODUTO_LABELS.fecharVersao
              : PRODUTO_LABELS.reabrirVersao}
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <DropdownMenuItem
            className="gap-2 text-destructive focus:text-destructive"
            onClick={() => onDelete(versao)}
          >
            <Trash2 className="h-4 w-4" />
            {PRODUTO_LABELS.excluir}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
