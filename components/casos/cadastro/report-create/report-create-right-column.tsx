"use client";

import { Button } from "@/components/ui/button";
import { ReportPrioridadeSlaCard } from "@/components/casos/shared/report-prioridade-sla-card";
import { Check } from "lucide-react";

export interface ReportCreateRightColumnProps {
  isSubmitting: boolean;
  isCreating: boolean;
}

export function ReportCreateRightColumn({
  isSubmitting,
  isCreating,
}: ReportCreateRightColumnProps) {
  return (
    <div className="flex w-full shrink-0 flex-col gap-2 lg:w-[292px]">
      <ReportPrioridadeSlaCard />

      <div className="rounded-lg border border-border-accent bg-gradient-to-br from-bg-accent-start to-bg-accent-end p-4">
        <Button type="submit" className="w-full" disabled={isCreating || isSubmitting}>
          <Check className="h-3.5 w-3.5" />
          {isCreating || isSubmitting ? "Abrindo Report..." : "Abrir Report"}
        </Button>
      </div>
    </div>
  );
}
