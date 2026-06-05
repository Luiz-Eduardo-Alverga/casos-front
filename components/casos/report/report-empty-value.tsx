import { cn } from "@/lib/utils";

export interface ReportEmptyValueProps {
  children: string;
  className?: string;
}

export function ReportEmptyValue({ children, className }: ReportEmptyValueProps) {
  return (
    <span
      className={cn(
        "text-xs font-medium italic text-muted-foreground whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}
