"use client";

import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { StatusMultiSelect } from "@/components/fields/status-multi-select";

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
}

export function EscopoFiltrosBar({
  statusIds,
  onStatusIdsChange,
  onDevChange,
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
