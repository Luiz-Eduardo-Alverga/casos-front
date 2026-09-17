"use client";

import { Check } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ProdutoVersaoData } from "@/services/produtos/types";
import { ProdutoPessoaChip } from "@/components/produtos/tabela/produto-pessoa-chip";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { formatProdutoData } from "@/components/produtos/utils";
import { colaboradorLabelById } from "@/components/produtos/cadastro/utils";
import { VersaoAcoesMenu } from "@/components/produtos/edicao/versoes/versao-acoes-menu";
import { VersaoStatusBadge } from "@/components/produtos/edicao/versoes/versao-status-badge";
import {
  formatVersaoFechamento,
  formatVersaoFechamentoMobile,
} from "@/components/produtos/edicao/versoes/utils";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/auth";
import type { Usuario } from "@/services/auxiliar/usuarios";

export interface VersoesTabelaRowProps {
  versao: ProdutoVersaoData;
  canEdit: boolean;
  canDelete: boolean;
  usuarios?: Usuario[];
  currentUser?: User | null;
  onEdit: (versao: ProdutoVersaoData) => void;
  onToggleStatus: (versao: ProdutoVersaoData) => void;
  onDelete: (versao: ProdutoVersaoData) => void;
}

export function VersoesTabelaRow({
  versao,
  canEdit,
  canDelete,
  usuarios,
  currentUser,
  onEdit,
  onToggleStatus,
  onDelete,
}: VersoesTabelaRowProps) {
  const fechamento = formatVersaoFechamento(
    versao.Status,
    versao.DataFechamentoProjeto,
    formatProdutoData,
  );
  const testadorNome = colaboradorLabelById(
    versao.testador_id,
    usuarios,
    currentUser,
  );
  const clickable = canEdit;

  return (
    <TableRow
      className={cn(
        "border-t border-border-divider",
        clickable && "cursor-pointer hover:bg-muted/30",
      )}
      onClick={clickable ? () => onEdit(versao) : undefined}
    >
      <TableCell className="px-4 py-4 align-middle font-mono text-sm font-semibold tabular-nums text-foreground">
        {versao.Versao}
      </TableCell>
      <TableCell className="px-4 py-4 align-middle">
        <VersaoStatusBadge status={versao.Status} />
      </TableCell>
      <TableCell className="px-4 py-4 align-middle text-sm tabular-nums text-foreground">
        {formatProdutoData(versao.DataAberturaProjeto)}
      </TableCell>
      <TableCell
        className={cn(
          "px-4 py-4 align-middle text-sm tabular-nums",
          fechamento.empty
            ? "text-muted-foreground"
            : fechamento.isPrevisao
              ? "text-muted-foreground"
              : "text-foreground",
        )}
        title={
          fechamento.empty
            ? PRODUTO_LABELS.semPrevisao
            : fechamento.isPrevisao
              ? PRODUTO_LABELS.previsaoFechamento
              : undefined
        }
      >
        {fechamento.label}
      </TableCell>
      <TableCell className="max-w-[12rem] truncate px-4 py-4 align-middle text-sm text-muted-foreground">
        {versao.NotasdaVersao?.trim() || "—"}
      </TableCell>
      <TableCell className="px-4 py-4 text-center align-middle">
        {versao.Helptools ? (
          <Check
            className="mx-auto h-4 w-4 text-status-success"
            aria-label={PRODUTO_LABELS.helptools}
          />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="px-4 py-4 align-middle">
        <ProdutoPessoaChip nome={testadorNome} />
      </TableCell>
      {canEdit || canDelete ? (
        <TableCell className="px-4 py-4 text-right align-middle">
          <VersaoAcoesMenu
            versao={versao}
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        </TableCell>
      ) : null}
    </TableRow>
  );
}

export function VersaoListaMobileCard({
  versao,
  canEdit,
  canDelete,
  onEdit,
  onToggleStatus,
  onDelete,
}: Omit<VersoesTabelaRowProps, "usuarios" | "currentUser">) {
  const clickable = canEdit;
  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-b border-border-divider px-4 py-4",
        clickable && "cursor-pointer",
      )}
      onClick={clickable ? () => onEdit(versao) : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
          {versao.Versao}
        </span>
        <div className="flex items-center gap-2">
          <VersaoStatusBadge status={versao.Status} />
          {canEdit || canDelete ? (
            <VersaoAcoesMenu
              versao={versao}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          ) : null}
        </div>
      </div>
      <p className="text-xs tabular-nums text-muted-foreground">
        Abertura {formatProdutoData(versao.DataAberturaProjeto)} ·{" "}
        {formatVersaoFechamentoMobile(
          versao.Status,
          versao.DataFechamentoProjeto,
          formatProdutoData,
        )}
      </p>
      {versao.NotasdaVersao?.trim() ? (
        <p className="text-sm text-foreground">{versao.NotasdaVersao}</p>
      ) : null}
    </div>
  );
}
