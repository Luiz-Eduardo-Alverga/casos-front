import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DOC_STATUS_LABELS } from "./constants";
import type { DocCategory, DocFilters } from "@/services/db-api/docs";

export function DocsFiltrosAplicadosBadges({
  filtros,
  categories,
  onRemove,
  onClear,
}: {
  filtros: DocFilters;
  categories: DocCategory[];
  onRemove: (key: keyof DocFilters) => void;
  onClear: () => void;
}) {
  const items = [
    filtros.search
      ? { key: "search" as const, label: `Busca: ${filtros.search}` }
      : null,
    filtros.categoryId
      ? {
          key: "categoryId" as const,
          label:
            categories.find((item) => item.id === filtros.categoryId)?.name ??
            "Categoria",
        }
      : null,
    filtros.status
      ? {
          key: "status" as const,
          label: DOC_STATUS_LABELS[filtros.status],
        }
      : null,
    filtros.sector
      ? { key: "sector" as const, label: filtros.sector }
      : null,
    filtros.tag ? { key: "tag" as const, label: `Tag: ${filtros.tag}` } : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <Badge
          key={item.key}
          variant="secondary"
          className="gap-2 px-2 py-1 font-normal"
        >
          {item.label}
          <button
            type="button"
            onClick={() => onRemove(item.key)}
            aria-label={`Remover filtro ${item.label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </Badge>
      ))}
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto px-0 text-xs"
        onClick={onClear}
      >
        Limpar filtros
      </Button>
    </div>
  );
}
