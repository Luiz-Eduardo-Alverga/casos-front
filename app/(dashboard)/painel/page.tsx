"use client";

import { PainelKanban } from "@/components/painel-kanban";
import { RequirePermission } from "@/components/require-permission";

export default function PainelPage() {
  return (
    <RequirePermission
      permission="list-painel-dev"
      redirectTo="/avisos"
      toastMessage="Sem permissão para acessar o Painel do desenvolvedor."
    >
      <PainelKanban />
    </RequirePermission>
  );
}
