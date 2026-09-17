"use client";

import Link from "next/link";
import { FilterX, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { ProdutosFiltros } from "@/components/produtos/filtros/produtos-filtros";
import { ProdutosTabela } from "@/components/produtos/tabela/produtos-tabela";
import { useProdutoPermissoes } from "@/hooks/produtos/use-produto-permissoes";
import { useProdutosFiltros } from "@/hooks/produtos/use-produtos-filtros";

export function Produtos() {
  const { canCreate } = useProdutoPermissoes();
  const { filtros, setFiltro, limparFiltros, hasFilters } = useProdutosFiltros();

  return (
    <ListagemPageLayout
      title={PRODUTO_LABELS.pageTitle}
      subtitle={PRODUTO_LABELS.pageSubtitle}
      className="gap-2 lg:min-h-0 lg:overflow-hidden"
      actions={
        <>
          {hasFilters ? (
            <Button
              type="button"
              variant="outline"
              className="w-full px-4 sm:w-auto"
              onClick={limparFiltros}
            >
              <FilterX className="h-4 w-4" />
              {PRODUTO_LABELS.limparFiltros}
            </Button>
          ) : null}
          {canCreate ? (
            <Button asChild className="w-full px-4 sm:w-auto">
              <Link href="/produtos/novo">
                <Plus className="h-4 w-4" />
                {PRODUTO_LABELS.novo}
              </Link>
            </Button>
          ) : null}
        </>
      }
    >
      <ProdutosFiltros
        filtros={filtros}
        onChange={setFiltro}
        onClear={limparFiltros}
      />
      <ProdutosTabela
        filtros={filtros}
        onClearFilters={limparFiltros}
      />
    </ListagemPageLayout>
  );
}
