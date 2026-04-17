"use client";

import { cn } from "@/lib/utils";

const ALTURA_MIN_ANOTACAO = "min-h-[58px]";

interface CasoResumoInfoBoxProps {
  title: string;
  content?: string | null;
  contentClassName?: string;
}

export function CasoResumoInfoBox({
  title,
  content,
  contentClassName,
}: CasoResumoInfoBoxProps) {
  return (
    <div className="content-stretch relative flex w-full min-w-0 max-w-full shrink-0 flex-col items-start gap-2">
      <div className="content-stretch relative flex w-full min-w-0 max-w-full shrink-0 flex-col items-start">
        <p className="text-sm font-medium text-text-secondary leading-5">{title}</p>
      </div>
      <div
        className={cn(
          "w-full min-w-0 max-w-full rounded-lg border-l-4 border-primary bg-muted/30 p-2.5 text-xs font-semibold leading-5 text-foreground whitespace-pre-wrap [overflow-wrap:anywhere]",
          ALTURA_MIN_ANOTACAO,
          contentClassName,
        )}
      >
        {content?.trim() ? content : "Não informado."}
      </div>
    </div>
  );
}

