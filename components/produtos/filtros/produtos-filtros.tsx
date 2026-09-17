"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Filter, Search, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CasoFormSetor } from "@/components/fields";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { useDebouncedValue } from "@/hooks/shared/use-debounced-value";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { ProdutosFiltrosAplicadosBadges } from "@/components/produtos/filtros/produtos-filtros-aplicados-badges";
import type { ProdutosFiltrosAplicados } from "@/components/produtos/filtros/produtos-filtros.types";

interface ProdutosFiltrosProps {
  filtros: ProdutosFiltrosAplicados;
  onChange: (key: keyof ProdutosFiltrosAplicados, value: string | undefined) => void;
  onClear: () => void;
}

export function ProdutosFiltros({
  filtros,
  onChange,
  onClear,
}: ProdutosFiltrosProps) {
  const [nome, setNome] = useState(filtros.nome);
  const debouncedNome = useDebouncedValue(nome, 400);
  const { data: setores = [] } = useSetores({ enabled: true });
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

  useEffect(() => setNome(filtros.nome), [filtros.nome]);

  useEffect(() => {
    if (debouncedNome !== filtros.nome) {
      onChange("nome", debouncedNome || undefined);
    }
  }, [debouncedNome, filtros.nome, onChange]);

  useEffect(() => {
    if (setores.length === 0) return;
    const desiredId = filtros.setor
      ? String(setores.find((setor) => setor.nome === filtros.setor)?.id ?? "")
      : "";
    if (sectorForm.getValues("setor") !== desiredId) {
      syncingSectorRef.current = true;
      sectorForm.setValue("setor", desiredId);
    }
  }, [filtros.setor, sectorForm, setores]);

  useEffect(() => {
    if (setores.length === 0) return;
    if (syncingSectorRef.current) {
      syncingSectorRef.current = false;
      return;
    }
    const sectorName = selectedSectorId
      ? setores.find((setor) => String(setor.id) === selectedSectorId)?.nome
      : undefined;
    if (selectedSectorId) {
      if ((sectorName ?? "") !== filtros.setor) {
        onChange("setor", sectorName);
      }
      return;
    }
    const setorAindaNoCatalogo = setores.some(
      (setor) => setor.nome === filtros.setor,
    );
    if (filtros.setor && setorAindaNoCatalogo) {
      onChange("setor", undefined);
    }
  }, [filtros.setor, onChange, setores, selectedSectorId]);

  return (
    <Card className="shrink-0 rounded-lg bg-card shadow-card">
      <CardHeader className="border-b border-border-divider p-4 pb-2">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold">
            {PRODUTO_LABELS.filtros}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6 pt-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-label">
              {PRODUTO_LABELS.nome}
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder={PRODUTO_LABELS.nomePlaceholder}
                className="h-9 rounded-lg border-border-input pl-9 pr-8"
                aria-label={PRODUTO_LABELS.nome}
              />
              {nome ? (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setNome("")}
                  aria-label="Limpar nome"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-label">
              {PRODUTO_LABELS.setor}
            </Label>
            <FormProvider {...sectorForm}>
              <CasoFormProvider value={sectorFormContext}>
                <CasoFormSetor required={false} hideLabel />
              </CasoFormProvider>
            </FormProvider>
          </div>
        </div>
        <ProdutosFiltrosAplicadosBadges
          filtros={filtros}
          onRemove={(key) => onChange(key, undefined)}
          onClear={onClear}
        />
      </CardContent>
    </Card>
  );
}
