"use client";

import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { StatusMultiSelect } from "@/components/fields/status-multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ESCOPO_NAO_PLANEJADO_OPTIONS,
  type EscopoNaoPlanejadoFiltro,
} from "@/components/projetos/edicao/escopo/utils";

export interface EscopoFiltrosFormValues {
  devAtribuido: string;
  devAtribuidoLabel: string;
}

const EMPTY_ESCOPO_FILTROS: EscopoFiltrosFormValues = {
  devAtribuido: "",
  devAtribuidoLabel: "",
};

export interface EscopoFiltrosBarProps {
  statusIds: string[];
  onStatusIdsChange: (value: string[]) => void;
  onDevChange: (devId: string) => void;
  naoPlanejadoFiltro: EscopoNaoPlanejadoFiltro;
  onNaoPlanejadoFiltroChange: (value: EscopoNaoPlanejadoFiltro) => void;
}

export function EscopoFiltrosBar({
  statusIds,
  onStatusIdsChange,
  onDevChange,
  naoPlanejadoFiltro,
  onNaoPlanejadoFiltroChange,
}: EscopoFiltrosBarProps) {
  const form = useForm<EscopoFiltrosFormValues>({
    defaultValues: EMPTY_ESCOPO_FILTROS,
  });

  const devAtribuido = form.watch("devAtribuido");

  useEffect(() => {
    onDevChange(devAtribuido ?? "");
  }, [devAtribuido, onDevChange]);

  const providerValue = useMemo(
    () => ({
      form,
      importanceOptions: [],
      isDisabled: false,
      lazyLoadComboboxOptions: true,
    }),
    [form],
  );

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
      {/* <div className="w-full sm:w-[192px]">
        <StatusMultiSelect
          value={statusIds}
          onChange={onStatusIdsChange}
          label="Status"
        />
      </div> */}
      <div className="w-full sm:w-[192px]">
        <Select
          value={naoPlanejadoFiltro}
          onValueChange={(value) =>
            onNaoPlanejadoFiltroChange(value as EscopoNaoPlanejadoFiltro)
          }
        >
          <SelectTrigger
            aria-label="Filtrar por planejamento"
            className="h-9 w-full rounded-lg border-border-input font-semibold"
          >
            <SelectValue placeholder="Planejamento: Todos" />
          </SelectTrigger>
          <SelectContent>
            {ESCOPO_NAO_PLANEJADO_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <CasoFormProvider value={providerValue}>
        <FormProvider {...form}>
          <div className="w-full sm:w-[292px]">
            <CasoFormDevAtribuido
              name="devAtribuido"
              labelName="devAtribuidoLabel"
              label="Desenvolvedor"
              required={false}
              requireProduto={false}
              hideLabel
              placeholder="Desenvolvedor: Todos"
              valueLabelPrefix="Desenvolvedor: "
            />
          </div>
        </FormProvider>
      </CasoFormProvider>
    </div>
  );
}
