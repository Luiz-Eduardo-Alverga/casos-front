"use client";

import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { MelhoriasFiltros } from "@/components/melhorias/filtros/melhorias-filtros";
import { MelhoriasTabela } from "@/components/melhorias/tabela/melhorias-tabela";
import { useMelhoriasFiltros } from "@/hooks/melhorias/use-melhorias-filtros";

export function Melhorias() {
  const { filtros, aplicarFiltros, limparFiltros } = useMelhoriasFiltros();

  return (
    <ListagemPageLayout
      title="Melhorias"
      subtitle="Acompanhe ideias e melhorias do painel por produto, setor e período."
    >
      <MelhoriasFiltros
        filtrosAplicados={filtros}
        onAplicar={aplicarFiltros}
        onLimpar={limparFiltros}
      />
      <MelhoriasTabela filtros={filtros} />
    </ListagemPageLayout>
  );
}
