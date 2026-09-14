"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { CircleDot, Filter, Folder, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useDebouncedValue } from "@/hooks/shared/use-debounced-value";
import { useDocCategories } from "@/hooks/docs/use-doc-categories";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { CasoFormSetor } from "@/components/fields";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { DocsFiltrosAplicadosBadges } from "./docs-filtros-aplicados-badges";
import { DOC_STATUS_OPTIONS } from "./constants";
import type { DocsFiltrosProps } from "./docs-filtros.types";
import type { DocStatus } from "@/services/db-api/docs";

export function DocsFiltros({
  filtros,
  onChange,
  onClear,
}: DocsFiltrosProps) {
  const [search, setSearch] = useState(filtros.search ?? "");
  const debouncedSearch = useDebouncedValue(search, 400);
  const { data: categories = [] } = useDocCategories();
  const { data: sectors = [] } = useSetores();
  const sectorForm = useForm<{ setor: string }>({
    defaultValues: { setor: "" },
  });
  const selectedSectorId = useWatch({
    control: sectorForm.control,
    name: "setor",
  });
  const syncingSectorRef = useRef(false);
  const sectorFormContext = useMemo(
    () => ({
      form: sectorForm,
      importanceOptions: [],
      isDisabled: false,
      lazyLoadComboboxOptions: false,
    }),
    [sectorForm],
  );

  useEffect(() => setSearch(filtros.search ?? ""), [filtros.search]);
  useEffect(() => {
    if (debouncedSearch !== (filtros.search ?? "")) {
      onChange("search", debouncedSearch || undefined);
    }
  }, [debouncedSearch, filtros.search, onChange]);

  useEffect(() => {
    if (sectors.length === 0) return;
    const desiredId = filtros.sector
      ? String(
          sectors.find((sector) => sector.nome === filtros.sector)?.id ?? "",
        )
      : "";
    if (sectorForm.getValues("setor") !== desiredId) {
      syncingSectorRef.current = true;
      sectorForm.setValue("setor", desiredId);
    }
  }, [filtros.sector, sectorForm, sectors]);

  useEffect(() => {
    if (sectors.length === 0) return;
    if (syncingSectorRef.current) {
      syncingSectorRef.current = false;
      return;
    }
    const sectorName = selectedSectorId
      ? sectors.find(
          (sector) => String(sector.id) === selectedSectorId,
        )?.nome
      : undefined;
    if (sectorName !== filtros.sector) {
      onChange("sector", sectorName);
    }
  }, [filtros.sector, onChange, sectors, selectedSectorId]);

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
          <ComboboxField
            label="Categoria"
            icon={Folder}
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            value={filtros.categoryId ?? ""}
            onValueChange={(value) =>
              onChange("categoryId", value || undefined)
            }
            placeholder="Categoria"
            emptyText="Nenhuma categoria encontrada."
            hideLabel
          />
          <ComboboxField
            label="Status"
            icon={CircleDot}
            options={DOC_STATUS_OPTIONS}
            value={filtros.status ?? ""}
            onValueChange={(value) =>
              onChange(
                "status",
                value ? (value as DocStatus) : undefined,
              )
            }
            placeholder="Status"
            emptyText="Nenhum status encontrado."
            hideLabel
          />
          <FormProvider {...sectorForm}>
            <CasoFormProvider value={sectorFormContext}>
              <CasoFormSetor hideLabel />
            </CasoFormProvider>
          </FormProvider>
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
