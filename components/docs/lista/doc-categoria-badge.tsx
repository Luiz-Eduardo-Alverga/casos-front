import { cn } from "@/lib/utils";

export function DocCategoriaBadge({ name }: { name: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1",
        "border-status-info/30 bg-status-info/10",
      )}
    >
      <span className="size-1 shrink-0 rounded-full bg-status-info" />
      <span className="whitespace-nowrap text-xs font-semibold text-status-info">
        {name}
      </span>
    </span>
  );
}
