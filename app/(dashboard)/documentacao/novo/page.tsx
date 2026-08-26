"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DocForm } from "@/components/docs/formulario";
import { RequirePermission } from "@/components/require-permission";
import { DocDetalheSkeleton } from "@/components/docs/detalhe/doc-detalhe-skeleton";

function NovoDocumentoForm() {
  const searchParams = useSearchParams();
  return (
    <DocForm
      mode="create"
      duplicateId={searchParams.get("duplicar")}
    />
  );
}

export default function NovoDocumentoPage() {
  return (
    <RequirePermission permission="create-doc">
      <Suspense fallback={<DocDetalheSkeleton />}>
        <NovoDocumentoForm />
      </Suspense>
    </RequirePermission>
  );
}
