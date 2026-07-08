"use client";

import { useCallback } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CasoEditClienteCombobox } from "@/components/casos/edicao/fields/caso-edit-cliente-combobox";
import type { VincularClienteFormProps, VincularClienteFormValues } from "./types";

export function VincularClienteForm({
  registro,
  isAdding,
  clienteId,
  clienteSelecionado,
  onAdd,
}: VincularClienteFormProps) {
  const methods = useFormContext<VincularClienteFormValues>();
  const { setValue } = methods;

  const handleClienteComboboxChange = useCallback(
    (id: string | undefined) => {
      setValue("clienteSelecionado", id);
      setValue("clienteId", id ?? "");
    },
    [setValue],
  );

  const handleAdicionar = async () => {
    const values = methods.getValues();
    const cId = Number(values.clienteId);
    if (!Number.isFinite(cId) || cId <= 0) return;

    await onAdd({
      registro,
      cliente: cId,
      incidente: 0,
    });

    methods.setValue("clienteId", "");
    methods.setValue("clienteSelecionado", undefined);
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_140px_auto]">
      <div className="min-w-0">
        <CasoEditClienteCombobox onClienteChange={handleClienteComboboxChange} />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="vincular-cliente-id"
          className="text-sm font-medium text-text-label"
        >
          Id Cliente
        </Label>
        <Input
          id="vincular-cliente-id"
          type="number"
          min={1}
          placeholder="Ex: 68073"
          className="h-9 rounded-lg border-border-input px-[17px] py-3"
          disabled={isAdding || Boolean(clienteSelecionado)}
          {...methods.register("clienteId")}
        />
      </div>

      <div className="flex items-end">
        <Button
          type="button"
          onClick={handleAdicionar}
          disabled={!clienteId.trim() || isAdding}
          className="h-9 w-full bg-primary text-primary-foreground hover:bg-primary/90 md:w-auto md:min-w-[120px]"
        >
          <UserPlus className="mr-2 h-3.5 w-3.5" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
