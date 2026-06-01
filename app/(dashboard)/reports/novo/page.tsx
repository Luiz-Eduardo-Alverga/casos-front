"use client";

import { ReportCreateForm } from "@/components/casos/cadastro";
import { RequirePermission } from "@/components/require-permission";

export default function ReportNovoPage() {
  return (
    <RequirePermission permission="create-report">
      <ReportCreateForm />
    </RequirePermission>
  );
}
