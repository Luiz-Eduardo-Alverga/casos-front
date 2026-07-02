"use client";

import { AuditoriaSquad } from "@/components/auditoria-squad";
import { RequirePermission } from "@/components/require-permission";

export default function AuditoriaHorasColaboradoresPage() {
  return (
    <RequirePermission permission={["audit-all-users", "audit-user"]}>
      <AuditoriaSquad />
    </RequirePermission>
  );
}
