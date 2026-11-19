"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FilterX, Plus } from "lucide-react";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { ProjetosFiltros } from "@/components/projetos/filtros/projetos-filtros";
import { ProjetosTabela } from "@/components/projetos/projetos-tabela";
import { ProjetoClonarModal } from "@/components/projetos/clonar";
import type { ProjetoClonadoDestaque } from "@/components/projetos/tabela/projetos-tabela-types";
import { useProjetosFiltros } from "@/hooks/projetos/use-projetos-filtros";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import type { SgpCadastroData } from "@/interfaces/sgp-cadastro";

export function Projetos() {
  const router = useRouter();
  const { filtrosAplicados, aplicarFiltros, limparFiltros } =
    useProjetosFiltros();
  const canCreateProject =
    !permissionsLoaded() || hasPermission("create-project");
  // Clonar cria um projeto: mesma permissão do cadastro (decisão #10).
  const canCloneProject = canCreateProject;

  const [origemClone, setOrigemClone] = useState<SgpCadastroData | null>(null);
  const [destaque, setDestaque] = useState<ProjetoClonadoDestaque | null>(null);

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
      <ProjetosTabela
        filtros={filtrosAplicados}
        onClonar={canCloneProject ? setOrigemClone : undefined}
        destaque={destaque}
      />
      {canCloneProject ? (
        <ProjetoClonarModal
          origem={origemClone}
          onOpenChange={(open) => {
            if (!open) setOrigemClone(null);
          }}
          onClonado={(novo) => {
            if (origemClone) {
              setDestaque({
                registro: novo.registro,
                origemRegistro: origemClone.registro,
              });
            }
          }}
        />
      ) : null}
    </ListagemPageLayout>
  );
}
