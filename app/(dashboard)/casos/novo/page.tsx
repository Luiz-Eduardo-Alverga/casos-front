"use client";

import { CasoCreateForm } from "@/components/casos/cadastro";
import { RequirePermission } from "@/components/require-permission";

export default function CasosPage() {
  return (
    <RequirePermission permission="create-case">
      <CasoCreateForm />
    </RequirePermission>
  );
}
