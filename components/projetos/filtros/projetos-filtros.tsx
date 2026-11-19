"use client";

import { useCallback, useEffect, useMemo, useRef, type FormEvent } from "react";
import { Controller, useForm, FormProvider, useWatch } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormSetor } from "@/components/fields/caso-form-setor";
import { MesPicker } from "@/components/fields/mes-picker";
import { importanceOptions } from "@/mocks/teste";
import { Filter, Search } from "lucide-react";
import type {
  ProjetoStatusFiltro,
  ProjetosFiltersForm,
  ProjetosFiltrosAplicados,
} from "@/components/projetos/filtros/projetos-filtros.types";
import { EMPTY_PROJETOS_FILTERS_FORM } from "@/components/projetos/filtros/projetos-filtros.types";
import {
  contarFiltrosAplicados,
  filtrosQueryKey,
  filtrosToFormDefaults,
  formToFiltrosAplicados,
  hasFiltersApplied,
} from "@/components/projetos/filtros/projetos-filtros-mappers";

const STATUS_TODOS = "todos";

const STATUS_OPCOES: { value: string; label: string }[] = [
  { value: STATUS_TODOS, label: "Todos" },
  { value: "ABERTO", label: "Aberto" },
  { value: "FECHADO", label: "Fechado" },
];

const LABEL_CLASS = "text-sm font-medium text-text-label";

interface ProjetosFiltrosProps {
  filtrosAplicados: ProjetosFiltrosAplicados;
  onAplicar: (filtros: ProjetosFiltrosAplicados) => void;
}

export function ProjetosFiltros({
  filtrosAplicados,
  onAplicar,
}: ProjetosFiltrosProps) {
  const appliedQueryKey = filtrosQueryKey(filtrosAplicados);
  const quantidadeAplicados = contarFiltrosAplicados(filtrosAplicados);

  const methods = useForm<ProjetosFiltersForm>({
    defaultValues: EMPTY_PROJETOS_FILTERS_FORM,
  });

  const lastFormSyncKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastFormSyncKeyRef.current === appliedQueryKey) return;
    lastFormSyncKeyRef.current = appliedQueryKey;
    methods.reset(filtrosToFormDefaults(filtrosAplicados));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- syncKey agrega deps; `methods` é estável
  }, [appliedQueryKey, filtrosAplicados]);

  const handleFiltrar = useCallback(() => {
    onAplicar(formToFiltrosAplicados(methods.getValues()));
  }, [methods, onAplicar]);

  const formValues = useWatch({ control: methods.control });
  const canFiltrar = useMemo(
    () =>
      hasFiltersApplied(
        formToFiltrosAplicados({ ...EMPTY_PROJETOS_FILTERS_FORM, ...formValues }),
      ),
    [formValues],
  );

  // Botão Filtrar e Enter em qualquer campo de texto (decisão #36).
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canFiltrar) return;
      handleFiltrar();
    },
    [canFiltrar, handleFiltrar],
  );

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto: "",
      isDisabled: false,
    }),
    [methods],
  );

  return (
    <CasoFormProvider value={providerValue}>
      <FormProvider {...methods}>
        <Card className="bg-card shadow-card rounded-lg shrink-0 mb-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border-divider p-4 pb-2">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-text-primary" />
              <CardTitle className="text-sm font-semibold text-text-primary">
                Filtros
              </CardTitle>
            </div>
            {quantidadeAplicados > 0 ? (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-text-secondary">
                {quantidadeAplicados === 1
                  ? "1 filtro aplicado"
                  : `${quantidadeAplicados} filtros aplicados`}
              </span>
            ) : null}
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <form
              className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-5"
              onSubmit={handleSubmit}
            >
              <div className="space-y-2">
                <Label htmlFor="projetos-filtro-registro" className={LABEL_CLASS}>
                  Id do Projeto
                </Label>
                <Input
                  id="projetos-filtro-registro"
                  inputMode="numeric"
                  placeholder="Busque pelo Id do projeto..."
                  className="h-9 rounded-lg border-border-input"
                  {...methods.register("registro", {
                    onChange: (e) => {
                      const digitos = String(e.target.value).replace(/\D/g, "");
                      if (digitos !== e.target.value) methods.setValue("registro", digitos);
                    },
                  })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="projetos-filtro-nome" className={LABEL_CLASS}>
                  Nome do projeto
                </Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="projetos-filtro-nome"
                    placeholder="Busque por parte do nome..."
                    className="h-9 rounded-lg border-border-input pl-8"
                    {...methods.register("nome")}
                  />
                </div>
              </div>

              <CasoFormSetor required={false} placeholder="Todos" />

              <div className="space-y-2">
                <Label htmlFor="projetos-filtro-status" className={LABEL_CLASS}>
                  Status
                </Label>
                <Controller
                  control={methods.control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value || STATUS_TODOS}
                      onValueChange={(v) =>
                        field.onChange(
                          (v === STATUS_TODOS ? "" : v) as ProjetoStatusFiltro,
                        )
                      }
                    >
                      <SelectTrigger
                        id="projetos-filtro-status"
                        ref={field.ref}
                        className="h-9 rounded-lg border-border-input"
                      >
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPCOES.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projetos-filtro-mes" className={LABEL_CLASS}>
                  Mês
                </Label>
                <Controller
                  control={methods.control}
                  name="mes"
                  render={({ field }) => (
                    <MesPicker
                      id="projetos-filtro-mes"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={!canFiltrar}
                  className="h-9 w-full px-4"
                >
                  <Search className="mr-2 h-3.5 w-3.5" />
                  <span>Filtrar</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </FormProvider>
    </CasoFormProvider>
  );
}
