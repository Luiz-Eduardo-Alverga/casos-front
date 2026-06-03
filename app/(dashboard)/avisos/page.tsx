"use client";

import { Suspense } from "react";
import { Avisos } from "@/components/avisos/avisos";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";

function AvisosLoading() {
  return (
    <ListagemPageLayout
      title="Avisos"
      subtitle="Visualize e gerencie seus avisos e notificações"
      className="lg:min-h-0 lg:overflow-hidden"
    >
      <div className="h-32" />
    </ListagemPageLayout>
  );
}

export default function AvisosPage() {
  return (
    <Suspense fallback={<AvisosLoading />}>
      <Avisos />
    </Suspense>
  );
}
