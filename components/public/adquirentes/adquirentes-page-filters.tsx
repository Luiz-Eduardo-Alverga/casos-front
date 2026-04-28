"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdquirentesPageFiltersProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  statusValue: string;
  onStatusValueChange: (value: string) => void;
  statusOptions: readonly string[];
}

const STATUS_SELECT_ALL = "__todos__";

export function AdquirentesPageFilters({
  searchInput,
  onSearchInputChange,
  statusValue,
  onStatusValueChange,
  statusOptions,
}: AdquirentesPageFiltersProps) {
  return (
    <div className="mb-4 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-public-placeholder" />
        <Input
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          placeholder="Pesquise a adquirente desejada"
          aria-label="Buscar adquirente"
          className="h-14 w-full rounded-2xl border-public-border bg-background pl-10 pr-3 text-base text-text-primary placeholder:text-public-placeholder focus-visible:ring-1 focus-visible:ring-public-focus"
        />
      </div>

      <Select
        value={statusValue.trim() ? statusValue : STATUS_SELECT_ALL}
        onValueChange={(next) =>
          onStatusValueChange(next === STATUS_SELECT_ALL ? "" : next)
        }
      >
        <SelectTrigger
          aria-label="Filtrar por status"
          className="h-14 w-full rounded-2xl border-public-border bg-background text-sm text-public-text-muted focus:ring-1 focus:ring-public-focus"
        >
          <SelectValue placeholder="Todos os status" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          <SelectItem value={STATUS_SELECT_ALL}>Todos os Status</SelectItem>
          {statusOptions.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
