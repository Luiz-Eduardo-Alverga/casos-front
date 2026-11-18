"use client";

import { NovoAviso } from "@/components/avisos/novo";
import { RequirePermission } from "@/components/require-permission";

export default function NovoAvisoPage() {
  return (
    <RequirePermission permission="create-aviso" redirectTo="/avisos">
      <NovoAviso />
    </RequirePermission>
  );
}
