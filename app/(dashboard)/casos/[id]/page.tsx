"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { CasoOuReportEditView } from "@/components/casos/caso-ou-report-edit-view";

interface CasoEditPageProps {
  params: Promise<{ id: string }>;
}

export default function CasoEditPage({ params }: CasoEditPageProps) {
  const router = useRouter();
  const { id } = use(params);

  if (!id || id === "novo") {
    router.replace("/casos");
    return null;
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden px-6 pt-20 py-10 lg:overflow-hidden">
      <CasoOuReportEditView casoId={id} />
    </div>
  );
}
