"use client";

import { Suspense } from "react";
import { Produtos } from "@/components/produtos/index";
import { RequirePermission } from "@/components/require-permission";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { PRODUTO_LABELS } from "@/components/produtos/constants";

function ProdutosLoading() {
  return (
    <ListagemPageLayout
      title={PRODUTO_LABELS.pageTitle}
      subtitle={PRODUTO_LABELS.pageSubtitle}
    >
      <div className="h-32" />
    </ListagemPageLayout>
  );
}

export default function ProdutosPage() {
  return (
    <RequirePermission permission="list-product">
      <Suspense fallback={<ProdutosLoading />}>
        <Produtos />
      </Suspense>
    </RequirePermission>
  );
}
