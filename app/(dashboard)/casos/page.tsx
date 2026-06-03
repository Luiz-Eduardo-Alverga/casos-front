"use client";

import { Suspense } from "react";
import { Casos } from "@/components/casos/index";
import { RequirePermission } from "@/components/require-permission";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";

function CasosLoading() {
  return (
    <ListagemPageLayout
      title="Casos"
      subtitle="Filtre e visualize os casos do projeto"
      className="lg:min-h-0 lg:overflow-hidden"
    >
      <div className="h-32" />
    </ListagemPageLayout>
  );
}

export default function CasosPage() {
  return (
    <RequirePermission permission={["list-case", "list-report"]}>
      <Suspense fallback={<CasosLoading />}>
        <Casos />
      </Suspense>
    </RequirePermission>
  );
}
