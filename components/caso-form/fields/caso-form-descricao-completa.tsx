"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCasoForm } from "../provider";
import { useFormContext } from "react-hook-form";

export function CasoFormDescricaoCompleta() {
  const { isDisabled } = useCasoForm();
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label
          htmlFor="description"
          className="text-sm font-medium text-text-label"
        >
          Descrição Completa <span className="text-text-error">*</span>
        </Label>

        {errors.DescricaoCompleta && (
          <p className="text-sm text-destructive">
            {errors.DescricaoCompleta.message as string}
          </p>
        )}
      </div>
      <Textarea
        id="description"
        placeholder="Descreva detalhadamente o caso, incluindo contexto, passos para reproduzir e comportamento esperado..."
        className="min-h-[158px]  rounded-lg border-border-input px-[17px] py-[13px]"
        {...register("DescricaoCompleta")}
        disabled={isDisabled}
      />
    </div>
  );
}
