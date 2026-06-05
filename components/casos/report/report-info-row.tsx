import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReportInfoRowProps {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  children: ReactNode;
  showBorder?: boolean;
}

export function ReportInfoRow({
  icon: Icon,
  iconClassName,
  label,
  children,
  showBorder = true,
}: ReportInfoRowProps) {
  return (
    <div
      className={cn(
        "flex min-h-[52px] items-center justify-between gap-3 py-3",
        showBorder && "border-b border-border-divider",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md",
            iconClassName,
          )}
        >
          <Icon className="size-3" />
        </div>
        <span className="text-xs font-medium text-text-label whitespace-nowrap">
          {label}
        </span>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
