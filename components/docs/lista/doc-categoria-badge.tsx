import { Badge } from "@/components/ui/badge";

export function DocCategoriaBadge({ name }: { name: string }) {
  return (
    <Badge
      variant="outline"
      className="border-status-info/30 bg-status-info/10 px-2 py-0 text-xs text-status-info"
    >
      {name}
    </Badge>
  );
}
