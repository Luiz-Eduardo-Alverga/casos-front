import { Star } from "lucide-react";
import type { AcquirerListExpandedItem } from "@/components/cadastros/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CompatibleDevice = AcquirerListExpandedItem["compatibleDevices"][number];

type AcquirerDevicesBadgesVariant = "table" | "card";

interface AcquirerDevicesBadgesProps {
  devices: CompatibleDevice[];
  maxInline?: number;
  variant?: AcquirerDevicesBadgesVariant;
  showPrimaryIcon?: boolean;
  emptyLabel?: React.ReactNode;
  className?: string;
}

const VARIANT_BADGE_CLASS: Record<AcquirerDevicesBadgesVariant, string> = {
  table: "gap-1 font-normal px-2 py-0.5 text-xs border-0",
  card: "rounded-md border border-border-divider bg-white px-2 py-0 text-[10px] font-semibold text-muted-foreground",
};

const VARIANT_PRIMARY_BADGE_CLASS: Record<
  AcquirerDevicesBadgesVariant,
  string
> = {
  table: "bg-violet-600 text-white hover:bg-violet-600/90",
  card: "border-violet-600 bg-violet-600 text-white",
};

export function AcquirerDevicesBadges({
  devices,
  maxInline = 5,
  variant = "table",
  showPrimaryIcon = variant === "table",
  emptyLabel,
  className,
}: AcquirerDevicesBadgesProps) {
  if (devices.length === 0) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        {emptyLabel ?? "—"}
      </span>
    );
  }

  const shown = devices.slice(0, maxInline);
  const overflow = devices.length - shown.length;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {shown.map((d) => (
        <Badge
          key={d.deviceId}
          variant="secondary"
          className={cn(
            VARIANT_BADGE_CLASS[variant],
            d.isPrimary
              ? VARIANT_PRIMARY_BADGE_CLASS[variant]
              : variant === "table"
                ? "bg-muted text-foreground"
                : undefined,
          )}
        >
          {showPrimaryIcon && d.isPrimary ? (
            <Star
              className={cn(
                "fill-current shrink-0",
                variant === "table" ? "h-3 w-3" : "h-2.5 w-2.5",
              )}
              aria-hidden
            />
          ) : null}
          {d.deviceName}
        </Badge>
      ))}
      {overflow > 0 ? (
        <Badge
          variant="secondary"
          className={cn(
            variant === "table"
              ? "font-normal px-2 py-0.5 text-xs border-0 bg-muted text-foreground"
              : "rounded-md border border-border-divider bg-white px-2 py-0 text-[10px] font-semibold text-muted-foreground",
          )}
        >
          +{overflow}
        </Badge>
      ) : null}
    </div>
  );
}
