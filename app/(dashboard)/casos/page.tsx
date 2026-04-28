"use client";

import { Suspense } from "react";
import { Casos } from "@/components/casos";
import { RequirePermission } from "@/components/require-permission";

function CasosLoading() {
  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Casos</h1>
          <p className="text-sm text-text-secondary">
            Filtre e visualize os casos do projeto
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CasosPage() {
  return (
    <RequirePermission permission="list-case">
      <Suspense fallback={<CasosLoading />}>
        <Casos />
      </Suspense>
    </RequirePermission>
  );
}
