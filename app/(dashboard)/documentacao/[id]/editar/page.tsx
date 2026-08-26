"use client";

import { use } from "react";
import { DocForm } from "@/components/docs/formulario";
import { RequirePermission } from "@/components/require-permission";

export default function EditarDocumentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <RequirePermission permission="edit-doc">
      <DocForm mode="edit" docId={id} />
    </RequirePermission>
  );
}
