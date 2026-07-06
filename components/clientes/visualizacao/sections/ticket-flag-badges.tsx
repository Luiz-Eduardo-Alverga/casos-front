"use client";

import { cn } from "@/lib/utils";

type TicketFlagBadgeVariant = "urgente" | "atendimento-imediato";

const VARIANT_STYLES: Record<
  TicketFlagBadgeVariant,
  { container: string; dot: string; text: string }
> = {
  urgente: {
    container: "border-red-200 bg-red-50",
    dot: "bg-red-500",
    text: "text-red-700",
  },
  "atendimento-imediato": {
    container: "border-blue-200 bg-blue-50",
    dot: "bg-blue-500",
    text: "text-blue-700",
  },
};

interface TicketFlagBadgeProps {
  variant: TicketFlagBadgeVariant;
  label: string;
  className?: string;
}

export function TicketFlagBadge({
  variant,
  label,
  className,
}: TicketFlagBadgeProps) {
  const style = VARIANT_STYLES[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 whitespace-nowrap",
        style.container,
        className,
      )}
    >
      <span className={cn("size-1 shrink-0 rounded-full", style.dot)} />
      <span className={cn("text-xs font-semibold whitespace-nowrap", style.text)}>
        {label}
      </span>
    </span>
  );
}

interface TicketFlagBadgesProps {
  urgente: boolean;
  is: boolean;
  className?: string;
}

export function TicketFlagBadges({ urgente, is, className }: TicketFlagBadgesProps) {
  if (!urgente && !is) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {urgente ? (
        <TicketFlagBadge variant="urgente" label="Urgente" />
      ) : null}
      {is ? (
        <TicketFlagBadge
          variant="atendimento-imediato"
          label="Atendimento Imediato"
        />
      ) : null}
    </div>
  );
}
