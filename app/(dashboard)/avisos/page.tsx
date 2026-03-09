"use client";

import { Suspense } from "react";
import { Avisos } from "@/components/avisos/avisos";

function AvisosLoading() {
  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Avisos</h1>
          <p className="text-sm text-text-secondary">
            Visualize e gerencie seus avisos e notificações
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AvisosPage() {
  return (
    <Suspense fallback={<AvisosLoading />}>
      <Avisos />
    </Suspense>
  );
}
