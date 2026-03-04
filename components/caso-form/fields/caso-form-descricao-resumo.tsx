"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCasoForm } from "../provider";
import { useFormContext } from "react-hook-form";

interface CasoFormDescricaoResumoProps {
  onOpenAssistant?: () => void;
}

export function CasoFormDescricaoResumo({ onOpenAssistant }: CasoFormDescricaoResumoProps) {
  const { isDisabled } = useCasoForm();
  const { register, formState: { errors } } = useFormContext();
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="summary" className="text-sm font-medium text-text-label">
          Resumo (Título) <span className="text-text-error">*</span>
        </Label>

        {errors.DescricaoResumo && (
          <p className="text-sm text-destructive">{errors.DescricaoResumo.message as string}</p>
        )}
      </div>
      <Input
        id="summary"
        {...register("DescricaoResumo")}
        placeholder="Resumo breve do caso"
        disabled={isDisabled}
        className="h-[42px] rounded-lg border-border-input px-[17px] py-3"
      />
      <p className="text-xs text-text-secondary">O resumo deve ser breve e descritivo</p>
    </div>
  );
}
