"use client";

import type { ReportCardData } from "./types";
import {
  ReportCategoriaBadge,
  ReportIdBadge,
  ReportPrioridadeBadge,
} from "./report-badges";

interface ReportModalInfoBlockProps {
  data: ReportCardData;
}

export function ReportModalInfoBlock({ data }: ReportModalInfoBlockProps) {
  return (
    <div className="rounded-md border border-border-divider bg-muted/30 px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <ReportIdBadge id={data.id} />
        <ReportCategoriaBadge categoria={data.categoria} />
        <ReportPrioridadeBadge prioridade={data.prioridade} />
      </div>

      <p className="mt-2.5 text-sm font-semibold leading-snug text-text-primary">
        {data.descricaoResumo}
      </p>
    </div>
  );
}
