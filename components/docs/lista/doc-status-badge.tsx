import { cn } from "@/lib/utils";
import type { DocStatus } from "@/services/db-api/docs";

const labels: Record<DocStatus, string> = {
  publicado: "Publicado",
  rascunho: "Rascunho",
  desatualizado: "Desatualizado",
};

export function DocStatusBadge({ status }: { status: DocStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1",
        status === "publicado" &&
          "border-status-success/30 bg-status-success/10",
        status === "rascunho" && "border-border bg-muted",
        status === "desatualizado" &&
          "border-status-warning/30 bg-status-warning/10",
      )}
    >
      <span
        className={cn(
          "size-1 shrink-0 rounded-full",
          status === "publicado" && "bg-status-success",
          status === "rascunho" && "bg-muted-foreground",
          status === "desatualizado" && "bg-status-warning",
        )}
      />
      <span
        className={cn(
          "whitespace-nowrap text-xs font-semibold",
          status === "publicado" && "text-status-success",
          status === "rascunho" && "text-muted-foreground",
          status === "desatualizado" && "text-status-warning",
        )}
      >
        {labels[status]}
      </span>
    </span>
  );
}
