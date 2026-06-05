"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CasoEditView } from "@/components/casos/edicao";
import { ReportEditView } from "@/components/casos/report";
import { CasoEditSkeleton } from "@/components/casos/edicao/caso-edit-skeleton";
import { EditCasoOuReportModal } from "@/components/casos/shared/edit-caso-ou-report-modal";
import {
  buildCasoEditHrefWithLayout,
  parseCasoEditLayout,
  type CasoEditLayout,
} from "@/lib/caso-edit-layout";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";

export interface CasoOuReportEditViewProps {
  casoId: string;
}

export function CasoOuReportEditView({ casoId }: CasoOuReportEditViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const layoutParam = parseCasoEditLayout(searchParams);
  const rbacReady = permissionsLoaded();

  const needsLayoutChoice =
    rbacReady &&
    hasPermission("edit-case") &&
    hasPermission("edit-report") &&
    !layoutParam;

  const applyLayoutChoice = (layout: CasoEditLayout) => {
    router.replace(
      buildCasoEditHrefWithLayout(casoId, layout, searchParams),
      { scroll: false },
    );
  };

  const handleDismissChoice = () => {
    router.push("/casos");
  };

  if (!rbacReady) {
    return <CasoEditSkeleton />;
  }

  if (needsLayoutChoice) {
    return (
      <EditCasoOuReportModal
        open
        onOpenChange={(open) => {
          if (!open) handleDismissChoice();
        }}
        numeroCaso={casoId}
        onSelectCase={() => applyLayoutChoice("case")}
        onSelectReport={() => applyLayoutChoice("report")}
      />
    );
  }

  const useReportLayout =
    layoutParam === "report" ||
    (layoutParam !== "case" && !hasPermission("list-case"));

  if (useReportLayout) {
    return <ReportEditView casoId={casoId} />;
  }

  return <CasoEditView casoId={casoId} />;
}
