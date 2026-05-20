"use client";

import { Suspense } from "react";
import { Projetos } from "@/components/projetos/index";
import { RequirePermission } from "@/components/require-permission";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";

function ProjetosLoading() {
  return (
    <ListagemPageLayout
      title="Ver Projetos"
      subtitle="Visualize e gerencie todos os projetos"
    >
      <div className="h-32" />
    </ListagemPageLayout>
  );
}

export default function ProjetosPage() {
  return (
    <RequirePermission permission="list-project">
      <Suspense fallback={<ProjetosLoading />}>
        <Projetos />
      </Suspense>
    </RequirePermission>
  );
}
