"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCasoForm } from "@/components/caso-form/provider";
import { useFormContext } from "react-hook-form";

export function CasoFormInformacoesAdicionais() {
  const { isDisabled } = useCasoForm();
  const { register } = useFormContext();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="additionalInfo" className="text-sm font-medium text-text-label">
        Informações Adicionais
      </Label>
      <Textarea
        id="additionalInfo"
        placeholder="Adicione qualquer informação complementar, links, evidências ou observações relevantes..."
        className="min-h-[88px] resize-none rounded-lg border-border-input px-[17px] py-[13px]"
        {...register("InformacoesAdicionais")}
        disabled={isDisabled}
      />
    </div>
  );
}
