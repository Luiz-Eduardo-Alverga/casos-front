"use client";

import { ProjetoCreateForm } from "@/components/projetos/cadastro";
import { RequirePermission } from "@/components/require-permission";

export default function ProjetosNovoPage() {
  return (
    <RequirePermission permission="create-project">
      <ProjetoCreateForm />
    </RequirePermission>
  );
}
