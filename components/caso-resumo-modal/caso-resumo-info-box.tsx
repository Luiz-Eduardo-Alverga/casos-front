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
    <div className="content-stretch flex flex-col gap-2 items-start relative shrink-0 w-full">
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
        <p className="text-sm font-medium text-text-secondary leading-5">{title}</p>
      </div>
      <div
        className={cn(
          "w-full rounded-lg bg-muted/30 p-2.5 border-l-4 border-primary text-xs font-semibold leading-5 text-foreground whitespace-pre-wrap",
          ALTURA_MIN_ANOTACAO,
          contentClassName,
        )}
      >
        {content?.trim() ? content : "Não informado."}
      </div>
    </div>
  );
}

