"use client";

import { useMemo } from "react";
import { Bug, Lightbulb } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { useCategorias } from "@/hooks/catalogos/use-categorias";
import { cn } from "@/lib/utils";
import type { ReportsFiltersForm } from "../types";
import { ReportsFiltroChip } from "./reports-filtro-chip";

const CATEGORIA_CHIPS = [
  { tipo: "BUG", label: "Bug", icon: Bug, iconClassName: "text-pink-700 dark:text-pink-400" },
  {
    tipo: "MELHORIA",
    label: "Melhoria",
    icon: Lightbulb,
    iconClassName: "text-blue-600 dark:text-blue-400",
  },
] as const;

export function ReportsFiltroCategoria() {
  const { data: categorias } = useCategorias();
  const { watch, setValue } = useFormContext<ReportsFiltersForm>();
  const categoria = watch("categoria");

  const options = useMemo(
    () =>
      CATEGORIA_CHIPS.map((chip) => {
        const found = (categorias ?? []).find(
          (item) => item.tipo_categoria.trim().toUpperCase() === chip.tipo,
        );
        return {
          ...chip,
          value: found ? String(found.id) : chip.tipo,
        };
      }),
    [categorias],
  );

  const selectedTipo = useMemo(() => {
    const current = String(categoria ?? "").trim();
    if (!current) return "";
    const byId = (categorias ?? []).find((item) => String(item.id) === current);
    return (byId?.tipo_categoria ?? current).trim().toUpperCase();
  }, [categoria, categorias]);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label className="text-sm font-medium text-text-label">Categoria</Label>
      <div className="flex w-full gap-2" role="group" aria-label="Categoria">
        {options.map((option) => {
          const Icon = option.icon;
          const pressed = selectedTipo === option.tipo;
          return (
            <ReportsFiltroChip
              key={option.tipo}
              pressed={pressed}
              label={option.label}
              className="min-w-0 flex-1 justify-center"
              icon={<Icon className={cn("size-3.5 shrink-0", option.iconClassName)} aria-hidden />}
              onClick={() =>
                setValue("categoria", pressed ? "" : option.value, {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
            />
          );
        })}
      </div>
    </div>
  );
}
