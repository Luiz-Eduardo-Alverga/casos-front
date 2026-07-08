"use client";

import { LayoutList, Columns2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReportsViewMode } from "./types";

interface ReportsViewToggleProps {
  viewMode: ReportsViewMode;
  onChange: (mode: ReportsViewMode) => void;
}

export function ReportsViewToggle({
  viewMode,
  onChange,
}: ReportsViewToggleProps) {
  return (
    <div className="flex w-fit gap-0.5 rounded-md border border-border-divider bg-card p-0.5 shrink-0">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="Visualização em cards"
        className={cn(
          "h-7 gap-1 px-2 text-xs",
          viewMode === "cards" && "bg-muted",
        )}
        onClick={() => onChange("cards")}
      >
        <LayoutList className="h-3.5 w-3.5" />
        Cards
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="Visualização lista e detalhe"
        className={cn(
          "h-7 gap-1 px-2 text-xs",
          viewMode === "split" && "bg-muted",
        )}
        onClick={() => onChange("split")}
      >
        <Columns2 className="h-3.5 w-3.5" />
        Lista + detalhe
      </Button>
    </div>
  );
}
