import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DocStatus } from "@/services/db-api/docs";

const labels: Record<DocStatus, string> = {
  publicado: "Publicado",
  rascunho: "Rascunho",
  desatualizado: "Desatualizado",
};

export function DocStatusBadge({ status }: { status: DocStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2 py-0 text-xs",
        status === "publicado" &&
          "border-status-success/30 bg-status-success/10 text-status-success",
        status === "rascunho" &&
          "border-border bg-muted text-muted-foreground",
        status === "desatualizado" &&
          "border-status-warning/30 bg-status-warning/10 text-status-warning",
      )}
    >
      {labels[status]}
    </Badge>
  );
}
