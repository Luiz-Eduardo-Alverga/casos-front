"use client";

import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ProdutoData } from "@/services/produtos/types";
import { ProdutoPessoaChip } from "@/components/produtos/tabela/produto-pessoa-chip";
import {
  ProdutoStatusBadge,
  ProdutoVacaLeiteiraBadge,
} from "@/components/produtos/tabela/produto-status-badge";
import {
  formatProdutoData,
  isVacaLeiteira,
} from "@/components/produtos/utils";

interface ProdutosTabelaRowProps {
  produto: ProdutoData;
}

export function ProdutosTabelaRow({ produto }: ProdutosTabelaRowProps) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer border-t border-border-divider hover:bg-muted/30"
      onClick={() => router.push(`/produtos/${produto.Registro}`)}
    >
      <TableCell className="px-4 py-4 align-middle tabular-nums text-sm text-muted-foreground">
        #{produto.Registro}
      </TableCell>
      <TableCell className="min-w-0 px-4 py-4 align-middle">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {produto.NomeProjeto}
          </span>
          {isVacaLeiteira(produto.vacaLeiteira) ? (
            <ProdutoVacaLeiteiraBadge />
          ) : null}
        </span>
      </TableCell>
      <TableCell className="px-4 py-4 align-middle text-sm text-muted-foreground">
        {produto.Setor || "—"}
      </TableCell>
      <TableCell className="px-4 py-4 align-middle">
        <ProdutoPessoaChip nome={produto.PO} />
      </TableCell>
      <TableCell className="px-4 py-4 align-middle">
        <ProdutoPessoaChip nome={produto.ScrumMaster} />
      </TableCell>
      <TableCell className="px-4 py-4 align-middle text-sm tabular-nums text-muted-foreground">
        {formatProdutoData(produto.DataProjeto)}
      </TableCell>
      <TableCell className="px-4 py-4 align-middle">
        <span className="flex justify-end">
          <ProdutoStatusBadge desativado={produto.Desativado} />
        </span>
      </TableCell>
    </TableRow>
  );
}

export function ProdutoListaMobileCard({ produto }: ProdutosTabelaRowProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="flex w-full flex-col gap-2 border-b border-border-divider p-4 text-left hover:bg-muted/30"
      onClick={() => router.push(`/produtos/${produto.Registro}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">
          {produto.NomeProjeto}
        </span>
        <ProdutoStatusBadge desativado={produto.Desativado} />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs tabular-nums text-muted-foreground">
        <span>#{produto.Registro}</span>
        <span>·</span>
        <span>{produto.Setor || "—"}</span>
        <span>·</span>
        <span>{formatProdutoData(produto.DataProjeto)}</span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <ProdutoPessoaChip nome={produto.PO} />
        <ProdutoPessoaChip nome={produto.ScrumMaster} />
        {isVacaLeiteira(produto.vacaLeiteira) ? (
          <ProdutoVacaLeiteiraBadge />
        ) : null}
      </div>
    </button>
  );
}
