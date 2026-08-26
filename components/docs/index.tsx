"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { DocsFiltros } from "./filtros/docs-filtros";
import { DocsLista } from "./docs-lista";
import { useDocsFiltros } from "@/hooks/docs/use-docs-filtros";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";

export function Docs() {
  const { filtros, setFiltro, limparFiltros } = useDocsFiltros();
  const canCreate =
    !permissionsLoaded() || hasPermission("create-doc");

  return (
    <ListagemPageLayout
      title="Documentação"
      subtitle="Base de conhecimento técnico e de processo do time"
      className="gap-2 lg:min-h-0 lg:overflow-hidden"
      actions={
        canCreate ? (
          <Button asChild>
            <Link href="/documentacao/novo">
              <Plus className="h-4 w-4" />
              Novo documento
            </Link>
          </Button>
        ) : null
      }
    >
      <DocsFiltros
        filtros={filtros}
        onChange={setFiltro}
        onClear={limparFiltros}
      />
      <DocsLista filtros={filtros} canCreate={canCreate} />
    </ListagemPageLayout>
  );
}
