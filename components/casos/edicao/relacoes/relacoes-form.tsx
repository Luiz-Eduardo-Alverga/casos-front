"use client";

import type { UseFormReturn } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { TIPO_RELACAO_VALUES } from "./utils";
import type { RelacaoFormValues } from "./types";
import { useProjetoMemoriaById } from "@/hooks/casos/use-projeto-memoria-by-id";

export interface RelacoesFormProps {
  methods: UseFormReturn<RelacaoFormValues>;
  isSaving: boolean;
  disabled?: boolean;
  canSubmit: boolean;
  onSubmit: () => void | Promise<void>;
}

export function RelacoesForm({
  methods,
  isSaving,
  disabled = false,
  canSubmit,
  onSubmit,
}: RelacoesFormProps) {
  const isDisabled = disabled || isSaving;

  const casoRelacionadoValue = methods.watch("caso_relacionado");
  const [debouncedCasoRelacionado, setDebouncedCasoRelacionado] =
    useState<string>("");

  useEffect(() => {
    const normalized = String(casoRelacionadoValue ?? "").trim();
    const timer = window.setTimeout(() => {
      setDebouncedCasoRelacionado(normalized);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [casoRelacionadoValue]);

  const shouldFetch = useMemo(() => {
    if (isDisabled) return false;
    const value = debouncedCasoRelacionado.trim();
    if (value === "") return false;
    return /^\d+$/.test(value);
  }, [debouncedCasoRelacionado, isDisabled]);

  const projetoMemoriaQuery = useProjetoMemoriaById(debouncedCasoRelacionado, {
    enabled: shouldFetch,
  });

  useEffect(() => {
    const descricao =
      projetoMemoriaQuery.data?.data?.caso?.textos?.descricao_resumo ?? null;

    if (!projetoMemoriaQuery.isSuccess) return;

    methods.setValue("descricao_resumo", descricao ?? "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [methods, projetoMemoriaQuery.data, projetoMemoriaQuery.isSuccess]);

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 rounded-lg border border-border-divider bg-muted/30">
      <div className="space-y-2 min-w-[220px]">
        <Label className="text-sm font-medium text-text-label">
          Tipo de relação
        </Label>
        <Select
          value={methods.watch("tipo_relacao")}
          onValueChange={(value) => methods.setValue("tipo_relacao", value)}
          disabled={isDisabled}
        >
          <SelectTrigger className="h-9 rounded-lg border-border-input min-w-[190px]">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {TIPO_RELACAO_VALUES.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 min-w-[150px]">
        <Label
          htmlFor="caso-relacionado"
          className="text-sm font-medium text-text-label"
        >
          Numero do caso
        </Label>
        <Input
          id="caso-relacionado"
          maxLength={5}
          inputMode="numeric"
          {...methods.register("caso_relacionado")}
          placeholder="Caso numero..."
          className="h-9 rounded-lg border-border-input px-[17px] py-3"
          disabled={isDisabled}
        />
      </div>

      <div className="space-y-2 min-w-[240px] flex-1">
        <Label
          htmlFor="descricao-resumo-relacao"
          className="text-sm font-medium text-text-label"
        >
          Descricao resumida
        </Label>
        {projetoMemoriaQuery.isFetching ? (
          <Skeleton className="h-9 w-full rounded-lg" />
        ) : (
          <Input
            id="descricao-resumo-relacao"
            {...methods.register("descricao_resumo")}
            placeholder="Descreva a relação..."
            className="h-9 rounded-lg border-border-input px-[17px] py-3"
            disabled={isDisabled}
          />
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          className="h-9"
          onClick={onSubmit}
          disabled={!canSubmit || isDisabled}
        >
          <PlusCircle className="h-3.5 w-3.5 mr-2" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
