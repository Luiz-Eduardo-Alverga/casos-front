"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  Filter,
  FilterX,
  Hash,
  Search,
  Building2,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { useSetores } from "@/hooks/catalogos/use-setores";
import {
  formatDateFilterValue,
  filtrosQueryKey,
  hasFiltersApplied,
  parseDateFilterValue,
} from "@/components/melhorias/filtros/melhorias-filtros-mappers";
import type { MelhoriasFiltrosState } from "@/components/melhorias/filtros/melhorias-filtros.types";

interface MelhoriasFiltrosProps {
  filtrosAplicados: MelhoriasFiltrosState;
  onAplicar: (filtros: MelhoriasFiltrosState) => void;
  onLimpar: () => void;
}

type MelhoriasFiltrosFormValues = {
  produto: string;
};

const BOOLEAN_OPTIONS = [
  { value: "true", label: "Sim" },
  { value: "false", label: "Não" },
];

export function MelhoriasFiltros({
  filtrosAplicados,
  onAplicar,
  onLimpar,
}: MelhoriasFiltrosProps) {
  const { data: setores, isLoading: isSetoresLoading } = useSetores();

  const appliedKey = filtrosQueryKey(filtrosAplicados);
  const [draft, setDraft] = useState<MelhoriasFiltrosState>(filtrosAplicados);

  const methods = useForm<MelhoriasFiltrosFormValues>({
    defaultValues: {
      produto: filtrosAplicados.produtoId || "",
    },
  });

  const produto = methods.watch("produto");

  // Mantém o draft e o form alinhados aos filtros efetivos (defaults / URL).
  useEffect(() => {
    setDraft(filtrosAplicados);
    methods.setValue("produto", filtrosAplicados.produtoId || "", {
      shouldDirty: false,
    });
  }, [appliedKey, filtrosAplicados, methods]);

  // Espelha o produto do CasoFormProduto no draft (aplicado só no Filtrar).
  useEffect(() => {
    const nextProduto = String(produto ?? "").trim();
    setDraft((prev) =>
      prev.produtoId === nextProduto
        ? prev
        : { ...prev, produtoId: nextProduto },
    );
  }, [produto]);

  const setorOptions = useMemo(() => {
    const options = (setores ?? []).map((s) => ({
      value: s.nome,
      label: s.nome,
    }));
    // Garante exibição do setor efetivo antes do catálogo carregar.
    if (
      draft.setor.trim() &&
      !options.some((o) => o.value === draft.setor.trim())
    ) {
      options.unshift({
        value: draft.setor.trim(),
        label: draft.setor.trim(),
      });
    }
    return options;
  }, [setores, draft.setor]);

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions: [],
      produto: produto || "",
      isDisabled: false,
      lazyLoadComboboxOptions: false,
    }),
    [methods, produto],
  );

  const setDraftField = useCallback(
    <K extends keyof MelhoriasFiltrosState>(
      key: K,
      value: MelhoriasFiltrosState[K],
    ) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleFiltrar = useCallback(() => {
    onAplicar({
      ...draft,
      produtoId: String(methods.getValues("produto") ?? "").trim(),
    });
  }, [draft, methods, onAplicar]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleFiltrar();
    },
    [handleFiltrar],
  );

  const handleLimpar = useCallback(() => {
    onLimpar();
  }, [onLimpar]);

  const canLimpar =
    hasFiltersApplied(filtrosAplicados) || hasFiltersApplied(draft);

  return (
    <Card className="mb-2 shrink-0 rounded-lg bg-card shadow-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border-divider px-5 py-2">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Filtros
          </CardTitle>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLimpar}
          disabled={!canLimpar}
          className="h-8 px-2 text-text-secondary"
        >
          <FilterX className="h-3.5 w-3.5" />
          Limpar filtros
        </Button>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        <FormProvider {...methods}>
          <CasoFormProvider value={providerValue}>
            <form
              className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4"
              onSubmit={handleSubmit}
            >
              <ComboboxField
                label="Setor"
                icon={Building2}
                options={setorOptions}
                value={draft.setor}
                onValueChange={(v) => setDraftField("setor", v)}
                placeholder="Todos os setores"
                emptyText="Nenhum setor encontrado."
                isLoading={isSetoresLoading}
                controlHeightClassName="h-9"
              />

              <DatePickerInput
                key={`data-inicial-${draft.dataInicial || "empty"}`}
                label="Data inicial"
                value={parseDateFilterValue(draft.dataInicial)}
                onChange={(date) =>
                  setDraftField("dataInicial", formatDateFilterValue(date))
                }
                placeholder="Selecionar data"
                controlHeightClassName="h-9"
              />

              <DatePickerInput
                key={`data-final-${draft.dataFinal || "empty"}`}
                label="Data final"
                value={parseDateFilterValue(draft.dataFinal)}
                onChange={(date) =>
                  setDraftField("dataFinal", formatDateFilterValue(date))
                }
                placeholder="Selecionar data"
                controlHeightClassName="h-9"
              />

              <CasoFormProduto required={false} />

              <div className="space-y-2">
                <Label className="text-sm font-medium text-text-label">
                  Busca
                </Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
                  <Input
                    value={draft.search}
                    onChange={(e) => setDraftField("search", e.target.value)}
                    placeholder="Buscar melhorias..."
                    className="h-9 rounded-lg border-border-input pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-text-label">
                  Registro
                </Label>
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
                  <Input
                    value={draft.registro}
                    onChange={(e) => setDraftField("registro", e.target.value)}
                    placeholder="Nº do registro"
                    className="h-9 rounded-lg border-border-input pl-8"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <ComboboxField
                label="Lacrar"
                icon={Lock}
                options={BOOLEAN_OPTIONS}
                value={draft.lacrar}
                onValueChange={(v) => setDraftField("lacrar", v)}
                placeholder="Todos"
                emptyText="Nenhuma opção."
                controlHeightClassName="h-9"
              />

              <ComboboxField
                label="Concluído"
                icon={CheckCircle2}
                options={BOOLEAN_OPTIONS}
                value={draft.concluido}
                onValueChange={(v) => setDraftField("concluido", v)}
                placeholder="Todos"
                emptyText="Nenhuma opção."
                controlHeightClassName="h-9"
              />

              <div className="flex sm:col-span-2 lg:col-span-4 lg:justify-end">
                <Button type="submit" className="w-full px-4 h-9 sm:w-[205px]">
                  <Search className="h-3.5 w-3.5 mr-2" />
                  Filtrar
                </Button>
              </div>
            </form>
          </CasoFormProvider>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
