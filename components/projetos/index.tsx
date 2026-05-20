"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FilterX, Plus } from "lucide-react";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { ProjetosFiltros } from "@/components/projetos/filtros/projetos-filtros";
import { ProjetosTabela } from "@/components/projetos/projetos-tabela";
import { useProjetosFiltros } from "@/hooks/projetos/use-projetos-filtros";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";

export function Projetos() {
  const router = useRouter();
  const { filtrosAplicados, aplicarFiltros, limparFiltros } =
    useProjetosFiltros();
  const canCreateProject =
    !permissionsLoaded() || hasPermission("create-project");

  return (
    <ListagemPageLayout
      title="Ver Projetos"
      subtitle="Visualize e gerencie todos os projetos"
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
          <Button
            variant="outline"
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            onClick={() => router.push("/painel")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao painel
          </Button>
          {canCreateProject ? (
            <Button
              type="button"
              className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
              onClick={() => router.push("/projetos/novo")}
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Cadastro
            </Button>
          ) : null}
        </>
      }
    >
      <ProjetosFiltros
        filtrosAplicados={filtrosAplicados}
        onAplicar={aplicarFiltros}
      />
      <ProjetosTabela filtros={filtrosAplicados} />
    </ListagemPageLayout>
  );
}
