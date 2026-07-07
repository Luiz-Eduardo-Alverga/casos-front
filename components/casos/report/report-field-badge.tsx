import { cn } from "@/lib/utils";

export type ReportFieldBadgeVariant = "caso" | "report" | "neutral";

export interface ReportFieldBadgeProps {
  label: string;
  variant?: ReportFieldBadgeVariant;
}

const variantStyles: Record<
  ReportFieldBadgeVariant,
  { container: string; dot: string; text: string }
> = {
  caso: {
    container: "bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800",
    dot: "bg-green-500 dark:bg-green-400",
    text: "text-green-700 dark:text-green-400",
  },
  report: {
    container: "bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800",
    dot: "bg-sky-500 dark:bg-sky-400",
    text: "text-sky-700 dark:text-sky-400",
  },
  neutral: {
    container: "bg-muted border-border-divider",
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
  },
};

export function ReportFieldBadge({
  label,
  variant = "neutral",
}: ReportFieldBadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        styles.container,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", styles.dot)} />
      <span className={cn("text-xs font-semibold whitespace-nowrap", styles.text)}>
        {label}
      </span>
    </span>
  );
}
