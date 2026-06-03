"use client";

import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { CircleDot, FilterX, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { CasoFormModulo } from "@/components/fields/caso-form-modulo";
import { CasoFormCategoria } from "@/components/fields/caso-form-categoria";
import { CasoFormUsuarioAbertura } from "@/components/fields/caso-form-usuario-abertura";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormQaAtribuido } from "@/components/fields/caso-form-qa-atribuido";
import { CasoFormProjeto } from "@/components/fields/caso-form-projeto";
import { StatusMultiSelect } from "@/components/fields/status-multi-select";
import type { CasosFiltersForm } from "@/components/casos/filtros/casos-filtros.types";

interface CasosFiltrosCamposExpandidosProps {
  onFiltrar: () => void;
  onLimparExpandidos?: () => void;
  filtrarDisabled?: boolean;
}

export function CasosFiltrosCamposExpandidos({
  onFiltrar,
  onLimparExpandidos,
  filtrarDisabled = false,
}: CasosFiltrosCamposExpandidosProps) {
  const { control, register } = useFormContext<CasosFiltersForm>();

  const tipoAberturaOptions = useMemo(
    () => [
      { value: "CASO", label: "CASO" },
      { value: "REPORT", label: "REPORT" },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-[18px] px-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[18px] items-end">
        <CasoFormProduto required={false} />
        <CasoFormVersao required={false} todas />
        <div className="min-w-0 col-span-2">
          <Controller
            name="status_ids"
            control={control}
            render={({ field }) => (
              <StatusMultiSelect
                value={field.value ?? []}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <CasoFormProjeto
          requireProduto={false}
          name="projeto_id"
          required={false}
          autoSelectProjeto="never"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[18px] items-end">
        <CasoFormModulo required={false} />
        <CasoFormCategoria required={false} />
        <div className="space-y-2 min-w-0 col-span-2">
          <Label className="text-sm font-medium text-text-label">
            Descrição / Resumo
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar por descrição ou resumo..."
              className="pl-9 h-9 rounded-lg border-border-input"
              {...register("descricao_resumo")}
            />
          </div>
        </div>
        <ComboboxField
          name="tipo_abertura"
          label="Tipo de abertura"
          icon={CircleDot}
          options={tipoAberturaOptions}
          placeholder="Todos"
          emptyText="Nenhuma opção encontrada."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[18px] items-end">
        <CasoFormDevAtribuido
          required={false}
          requireProduto={false}
          label="Desenvolvedor"
        />
        <CasoFormQaAtribuido
          required={false}
          requireProduto={false}
          label="QA"
        />

        <CasoFormUsuarioAbertura required={false} />
        <Controller
          name="data_producao_inicio"
          control={control}
          render={({ field }) => (
            <DatePickerInput
              label="Produção (início)"
              value={field.value}
              onChange={field.onChange}
              placeholder="Selecionar data"
              controlHeightClassName="h-9"
            />
          )}
        />
        <Controller
          name="data_producao_fim"
          control={control}
          render={({ field }) => (
            <DatePickerInput
              label="Produção (fim)"
              value={field.value}
              onChange={field.onChange}
              placeholder="Selecionar data"
              controlHeightClassName="h-9"
            />
          )}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
        <Button
          type="button"
          disabled={filtrarDisabled}
          onClick={onFiltrar}
          className="h-9 w-full sm:w-[205px]"
        >
          <Search className="h-3.5 w-3.5 mr-2" />
          <span>Filtrar</span>
        </Button>
      </div>
    </div>
  );
}
