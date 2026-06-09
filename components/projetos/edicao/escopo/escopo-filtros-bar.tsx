"use client";

import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { RefreshCcw } from "lucide-react";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  usuarioDevId: string;
  onDevChange: (devId: string) => void;
  naoPlanejadoFiltro: EscopoNaoPlanejadoFiltro;
  onNaoPlanejadoFiltroChange: (value: EscopoNaoPlanejadoFiltro) => void;
  onAtualizar: () => void;
  isAtualizando?: boolean;
}

export function EscopoFiltrosBar({
  statusIds,
  onStatusIdsChange,
  usuarioDevId,
  onDevChange,
  naoPlanejadoFiltro,
  onNaoPlanejadoFiltroChange,
  onAtualizar,
  isAtualizando = false,
}: EscopoFiltrosBarProps) {
  const form = useForm<EscopoFiltrosFormValues>({
    defaultValues: {
      ...EMPTY_ESCOPO_FILTROS,
      devAtribuido: usuarioDevId ?? "",
    },
  });

  const devAtribuido = form.watch("devAtribuido");

  useEffect(() => {
    const nextDevId = usuarioDevId ?? "";
    if ((devAtribuido ?? "") !== nextDevId) {
      form.setValue("devAtribuido", nextDevId, { shouldDirty: false });
    }
  }, [usuarioDevId, devAtribuido, form]);

  useEffect(() => {
    const value = devAtribuido ?? "";
    if (value !== (usuarioDevId ?? "")) {
      onDevChange(value);
    }
  }, [devAtribuido, onDevChange, usuarioDevId]);

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
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-lg border-border-input"
        onClick={onAtualizar}
        disabled={isAtualizando}
        aria-label="Atualizar escopo"
      >
        <RefreshCcw
          className={cn("h-3.5 w-3.5", isAtualizando && "animate-spin")}
          aria-hidden
        />
      </Button>
    </div>
  );
}
