"use client";

import { ReportCreateForm } from "@/components/caso-form";
import { RequirePermission } from "@/components/require-permission";

export default function ReportNovoPage() {
  return (
    <RequirePermission permission="create-case">
      <ReportCreateForm />
    </RequirePermission>
  );
}
