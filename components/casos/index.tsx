"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FilterX } from "lucide-react";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { CasosFiltros } from "./filtros/casos-filtros";
import { CasosTabela } from "./casos-tabela";
import { useCasosFiltros } from "@/hooks/casos/use-casos-filtros";

export function Casos() {
  const router = useRouter();
  const {
    filtrosAplicados,
    aplicarFiltros,
    limparFiltros,
  } = useCasosFiltros();

  return (
    <ListagemPageLayout
      title="Casos"
      subtitle="Filtre e visualize os casos do projeto"
      actions={
        <>
          <Button
            variant="outline"
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            onClick={limparFiltros}
          >
            <FilterX className="h-3.5 w-3.5" />
            Limpar filtros
          </Button>
        </>
      }
    >
      <CasosFiltros
        filtrosAplicados={filtrosAplicados}
        onAplicar={aplicarFiltros}
      />
      <CasosTabela filtros={filtrosAplicados} />
    </ListagemPageLayout>
  );
}
