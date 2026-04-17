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
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa4b2]" />
        <Input
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          placeholder="Pesquise a adquirente desejada"
          aria-label="Buscar adquirente"
          className="h-14 w-full rounded-2xl border-[#d7dde4] bg-white pl-10 pr-3 text-sm text-[#1f2937] placeholder:text-[#9aa4b2] focus-visible:ring-1 focus-visible:ring-orange-500"
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
          className="h-14 w-full rounded-2xl border-[#d7dde4] bg-white text-sm text-[#6b7280] focus:ring-1 focus:ring-orange-500"
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
