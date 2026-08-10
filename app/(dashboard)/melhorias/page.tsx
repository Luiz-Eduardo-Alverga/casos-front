"use client";

import { Suspense } from "react";
import { Melhorias } from "@/components/melhorias/index";
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
    <Suspense fallback={<MelhoriasLoading />}>
      <Melhorias />
    </Suspense>
  );
}
