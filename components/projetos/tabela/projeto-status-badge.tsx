import { cn } from "@/lib/utils";

interface ProjetoStatusBadgeProps {
  status: string;
  className?: string;
}

function normalizeStatus(status: string): string {
  return status?.trim().toUpperCase() ?? "";
}

export function ProjetoStatusBadge({ status, className }: ProjetoStatusBadgeProps) {
  const normalized = normalizeStatus(status);

  const styles =
    normalized === "ABERTO"
      ? "bg-blue-100 text-blue-800"
      : normalized === "FECHADO"
        ? "bg-green-100 text-green-800"
        : "bg-muted text-muted-foreground";

  const label =
    normalized === "ABERTO"
      ? "Aberto"
      : normalized === "FECHADO"
        ? "Fechado"
        : status || "—";

  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-[80px] items-center justify-center rounded-full px-2.5 text-xs font-semibold",
        styles,
        className,
      )}
    >
      {label}
    </span>
  );
}
