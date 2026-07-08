"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";

export function CasoFormAnexo() {
  const { isDisabled } = useCasoForm();
  const { register } = useFormContext();

  return (
    <div className="space-y-2">
      <Label htmlFor="anexo" className="text-sm font-medium text-text-label">
        Anexos
      </Label>
      <Textarea
        id="anexo"
        placeholder="Informações sobre anexos, referências ou links relacionados..."
        className="h-9 resize-none rounded-lg border-border-input px-[17px] py-[13px]"
        {...register("Anexo")}
        disabled={isDisabled}
      />
    </div>
  );
}
