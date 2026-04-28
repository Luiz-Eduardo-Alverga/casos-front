"use client";

import { Reports } from "@/components/caso-form/reports";
import { RequirePermission } from "@/components/require-permission";

export default function CasosPage() {
  return (
    <RequirePermission permission="create-case">
      <Reports />
    </RequirePermission>
  );
}
