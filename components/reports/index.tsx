"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { ReportsFiltros } from "./reports-filtros";
import { ReportsLista } from "./reports-lista";
import { EMPTY_REPORTS_FILTERS, type ReportsFiltrosAplicados } from "./types";

export function Reports() {
  const router = useRouter();
  const [filtrosAplicados, setFiltrosAplicados] =
    useState<ReportsFiltrosAplicados>(EMPTY_REPORTS_FILTERS);

  const handleAplicar = useCallback((filtros: ReportsFiltrosAplicados) => {
    setFiltrosAplicados(filtros);
  }, []);

  return (
    <ListagemPageLayout
      title="Reports"
      subtitle="Visualize e analise os reports abertos"
      actions={
        <Button
          variant="outline"
          type="button"
          className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
          onClick={() => router.push("/painel")}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao Painel
        </Button>
      }
    >
      <ReportsFiltros onAplicar={handleAplicar} />
      <ReportsLista filtros={filtrosAplicados} />
    </ListagemPageLayout>
  );
}
