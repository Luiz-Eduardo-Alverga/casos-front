"use client";

import { Suspense } from "react";
import { Reports } from "@/components/reports";
import { RequirePermission } from "@/components/require-permission";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";

function ReportsLoading() {
  return (
    <ListagemPageLayout
      title="Reports"
      subtitle="Visualize e analise os reports abertos"
      className="lg:min-h-0 lg:overflow-hidden"
    >
      <div className="h-32" />
    </ListagemPageLayout>
  );
}

export default function ReportsPage() {
  return (
    <RequirePermission permission="list-report">
      <Suspense fallback={<ReportsLoading />}>
        <Reports />
      </Suspense>
    </RequirePermission>
  );
}
