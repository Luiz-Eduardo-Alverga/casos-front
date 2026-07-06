"use client";

import { Suspense } from "react";
import { Clientes } from "@/components/clientes/index";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";

function ClientesLoading() {
  return (
    <ListagemPageLayout
      title="Clientes"
      subtitle="Consulte e visualize os clientes cadastrados"
    >
      <div className="h-32" />
    </ListagemPageLayout>
  );
}

export default function ClientesPage() {
  return (
    <Suspense fallback={<ClientesLoading />}>
      <Clientes />
    </Suspense>
  );
}
