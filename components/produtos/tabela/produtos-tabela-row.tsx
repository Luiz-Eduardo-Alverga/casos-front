"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, SquarePen } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { buildProdutoHrefForNewTab } from "@/lib/produto-standalone-url";
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

const ACAO_LINK_CLASS =
  "inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

/** Editar nesta aba / abrir em nova aba (mesmo padrão da listagem de Liberações). */
function ProdutoAcoesLinks({ produto }: ProdutosTabelaRowProps) {
  return (
    <div
      className="flex items-center justify-end gap-1"
      // Os links navegam sozinhos; não deixa o clique cair no da linha/card.
      onClick={(event) => event.stopPropagation()}
    >
      <Link
        href={`/produtos/${produto.Registro}`}
        aria-label={`${PRODUTO_LABELS.editarProduto} ${produto.Registro}`}
        title={PRODUTO_LABELS.editarProduto}
        className={ACAO_LINK_CLASS}
      >
        <SquarePen className="h-4 w-4 text-text-primary" />
      </Link>
      <Link
        href={buildProdutoHrefForNewTab(produto.Registro)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${PRODUTO_LABELS.abrirEmNovaAba} ${produto.Registro}`}
        title={PRODUTO_LABELS.abrirEmNovaAba}
        className={ACAO_LINK_CLASS}
      >
        <ExternalLink className="h-4 w-4 text-text-primary" />
      </Link>
    </div>
  );
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
      <TableCell className="px-4 py-4 align-middle">
        <ProdutoAcoesLinks produto={produto} />
      </TableCell>
    </TableRow>
  );
}

export function ProdutoListaMobileCard({ produto }: ProdutosTabelaRowProps) {
  const router = useRouter();

  // div clicável (não <button>): o card tem links dentro, e <a> dentro de <button>
  // é HTML inválido. Teclado e leitor de tela usam os links de ação.
  return (
    <div
      className="flex w-full cursor-pointer flex-col gap-2 border-b border-border-divider p-4 text-left hover:bg-muted/30"
      onClick={() => router.push(`/produtos/${produto.Registro}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">
          {produto.NomeProjeto}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <ProdutoStatusBadge desativado={produto.Desativado} />
          <ProdutoAcoesLinks produto={produto} />
        </div>
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
    </div>
  );
}
