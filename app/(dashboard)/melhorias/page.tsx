"use client";

import { Suspense } from "react";
import { Melhorias } from "@/components/melhorias/index";
import { RequirePermission } from "@/components/require-permission";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";

function MelhoriasLoading() {
  return (
    <ListagemPageLayout
      title="Melhorias"
      subtitle="Acompanhe ideias e melhorias do painel por produto, setor e período."
    >
      <div className="h-32" />
    </ListagemPageLayout>
  );
}

export default function MelhoriasPage() {
  return (
    <RequirePermission permission="list-improvement">
      <Suspense fallback={<MelhoriasLoading />}>
        <Melhorias />
      </Suspense>
    </RequirePermission>
  );
}
