"use client";

import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { ReportsFiltros } from "./reports-filtros";
import { ReportsLista } from "./reports-lista";
import { useReportsFiltros } from "@/hooks/reports/use-reports-filtros";

export function Reports() {
  const { filtrosAplicados, aplicarFiltros, limparFiltros } =
    useReportsFiltros();

  return (
    <ListagemPageLayout
      title="Reports"
      subtitle="Visualize e analise os reports abertos"
      actions={
        <Button
          variant="outline"
          type="button"
          className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
          onClick={limparFiltros}
        >
          <FilterX className="h-3.5 w-3.5" />
          Limpar filtros
        </Button>
      }
    >
      <ReportsFiltros
        filtrosAplicados={filtrosAplicados}
        onAplicar={aplicarFiltros}
      />
      <ReportsLista filtros={filtrosAplicados} />
    </ListagemPageLayout>
  );
}
