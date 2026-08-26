"use client";

import { useEffect, useState } from "react";
import { Filter, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/shared/use-debounced-value";
import { useDocCategories } from "@/hooks/docs/use-doc-categories";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { DocsFiltrosAplicadosBadges } from "./docs-filtros-aplicados-badges";
import { DOC_STATUS_OPTIONS } from "./constants";
import type { DocsFiltrosProps } from "./docs-filtros.types";
import type { DocStatus } from "@/services/db-api/docs";

const ALL = "__all__";

export function DocsFiltros({
  filtros,
  onChange,
  onClear,
}: DocsFiltrosProps) {
  const [search, setSearch] = useState(filtros.search ?? "");
  const debouncedSearch = useDebouncedValue(search, 400);
  const { data: categories = [] } = useDocCategories();
  const { data: sectors = [] } = useSetores();

  useEffect(() => setSearch(filtros.search ?? ""), [filtros.search]);
  useEffect(() => {
    if (debouncedSearch !== (filtros.search ?? "")) {
      onChange("search", debouncedSearch || undefined);
    }
  }, [debouncedSearch, filtros.search, onChange]);

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardHeader className="border-b border-border-divider p-4 pb-2">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold">Filtros</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6 pt-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar documentos"
              className="pl-9"
              aria-label="Buscar documentos"
            />
          </div>
          <Select
            value={filtros.categoryId ?? ALL}
            onValueChange={(value) =>
              onChange("categoryId", value === ALL ? undefined : value)
            }
          >
            <SelectTrigger aria-label="Filtrar por categoria">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filtros.status ?? ALL}
            onValueChange={(value) =>
              onChange(
                "status",
                value === ALL ? undefined : (value as DocStatus),
              )
            }
          >
            <SelectTrigger aria-label="Filtrar por status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os status</SelectItem>
              {DOC_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filtros.sector ?? ALL}
            onValueChange={(value) =>
              onChange("sector", value === ALL ? undefined : value)
            }
          >
            <SelectTrigger aria-label="Filtrar por setor">
              <SelectValue placeholder="Setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os setores</SelectItem>
              {sectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.nome}>
                  {sector.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DocsFiltrosAplicadosBadges
          filtros={filtros}
          categories={categories}
          onRemove={(key) => onChange(key, undefined)}
          onClear={onClear}
        />
      </CardContent>
    </Card>
  );
}
