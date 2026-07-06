"use client";

import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CasoEditClienteCombobox } from "../fields/caso-edit-cliente-combobox";
import { UserPlus } from "lucide-react";
import type { ClientesFormValues } from "./types";
import { useCasoEdit } from "../caso-edit-context";

export interface ClientesFormProps {
  methods: UseFormReturn<ClientesFormValues>;
  isAdding: boolean;
  clienteId: string;
  clienteSelecionado?: string;
  onAdd: (payload: {
    registro: number;
    cliente: number;
    incidente: number;
  }) => Promise<void>;
}

export function ClientesForm({
  methods,
  isAdding,
  clienteId,
  clienteSelecionado,
  onAdd,
}: ClientesFormProps) {
  const { numeroCaso, canEditCase } = useCasoEdit();
  const { setValue } = methods;

  const handleClienteComboboxChange = useCallback(
    (registro: string | undefined) => {
      setValue("clienteSelecionado", registro);
      setValue("clienteId", registro ?? "");
    },
    [setValue],
  );

  const handleAdicionar = async () => {
    const values = methods.getValues();
    const cId = Number(values.clienteId);
    if (!Number.isFinite(cId) || cId <= 0) return;
    await onAdd({
      registro: numeroCaso,
      cliente: cId,
      incidente: 0,
    });
    methods.setValue("clienteId", "");
    methods.setValue("clienteSelecionado", undefined);
  };

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 rounded-lg border border-border-divider bg-muted/30">
      <div className="space-y-2 min-w-[220px] flex-1">
        <CasoEditClienteCombobox
          onClienteChange={handleClienteComboboxChange}
          disabled={!canEditCase}
        />
      </div>

      <div className="space-y-2 min-w-[120px]">
        <Label
          htmlFor="cliente-id"
          className="text-sm font-medium text-text-label"
        >
          ID Cliente
        </Label>
        <Input
          id="cliente-id"
          type="number"
          min={1}
          placeholder="Ex: 68703"
          className="h-9 rounded-lg border-border-input px-[17px] py-3"
          disabled={isAdding || Boolean(clienteSelecionado) || !canEditCase}
          {...methods.register("clienteId")}
        />
      </div>

      <Button
        type="button"
        onClick={handleAdicionar}
        disabled={!clienteId.trim() || isAdding || !canEditCase}
        className="shrink-0 h-9"
      >
        <UserPlus className="h-3.5 w-3.5 mr-2" />
        Adicionar
      </Button>
    </div>
  );
}
