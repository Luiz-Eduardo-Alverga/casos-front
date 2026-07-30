"use client";

import { MinhaVisao } from "@/components/minha-visão/minha-visao";
import { RequirePermission } from "@/components/require-permission";

export default function MinhaVisaoPage() {
  return (
    <RequirePermission
      permission="list-minha-visao"
      redirectTo="/avisos"
      toastMessage="Sem permissão para acessar o Painel Minha visão."
    >
      <MinhaVisao />
    </RequirePermission>
  );
}
