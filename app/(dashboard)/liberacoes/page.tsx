"use client";

import { Suspense } from "react";
import { Liberacoes } from "@/components/liberacoes/index";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";

function LiberacoesLoading() {
  return (
    <ListagemPageLayout
      title="Registro de Liberação"
      subtitle="Acompanhe versões piloto, versão final e casos vinculados por produto."
    >
      <div className="h-32" />
    </ListagemPageLayout>
  );
}

export default function LiberacoesPage() {
  return (
    <Suspense fallback={<LiberacoesLoading />}>
      <Liberacoes />
    </Suspense>
  );
}
