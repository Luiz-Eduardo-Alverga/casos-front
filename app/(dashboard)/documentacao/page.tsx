"use client";

import { Suspense } from "react";
import { Docs } from "@/components/docs";
import { RequirePermission } from "@/components/require-permission";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";

function DocsLoading() {
  return (
    <ListagemPageLayout
      title="Documentação"
      subtitle="Base de conhecimento técnico e de processo do time"
    >
      <div className="h-32" />
    </ListagemPageLayout>
  );
}

export default function DocumentacaoPage() {
  return (
    <RequirePermission permission="list-doc">
      <Suspense fallback={<DocsLoading />}>
        <Docs />
      </Suspense>
    </RequirePermission>
  );
}
