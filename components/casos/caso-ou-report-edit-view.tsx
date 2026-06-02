"use client";

import { CasoEditView } from "@/components/casos/edicao";
import { ReportEditView } from "@/components/casos/report";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";

export interface CasoOuReportEditViewProps {
  casoId: string;
}

export function CasoOuReportEditView({ casoId }: CasoOuReportEditViewProps) {
  const rbacReady = permissionsLoaded();
  const useReportLayout = rbacReady && !hasPermission("list-case");

  if (useReportLayout) {
    return <ReportEditView casoId={casoId} />;
  }

  return <CasoEditView casoId={casoId} />;
}
