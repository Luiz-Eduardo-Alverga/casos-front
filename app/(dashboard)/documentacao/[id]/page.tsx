"use client";

import { use } from "react";
import { DocDetalhe } from "@/components/docs/detalhe";
import { RequirePermission } from "@/components/require-permission";

export default function DocumentoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <RequirePermission permission="list-doc">
      <DocDetalhe docId={id} />
    </RequirePermission>
  );
}
