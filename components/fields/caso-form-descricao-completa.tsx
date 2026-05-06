"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCasoForm } from "@/components/caso-form/provider";
import { useFormContext } from "react-hook-form";
import { Paperclip } from "lucide-react";

export interface CasoFormDescricaoCompletaProps {
  onOpenAnexos?: () => void;
  anexosCount?: number;
  showAnexosTrigger?: boolean;
}

export function CasoFormDescricaoCompleta({
  onOpenAnexos,
  anexosCount = 0,
  showAnexosTrigger = false,
}: CasoFormDescricaoCompletaProps) {
  const { isDisabled } = useCasoForm();
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Label
            htmlFor="description"
            className="text-sm font-medium text-text-label"
          >
            Descrição Completa <span className="text-text-error">*</span>
          </Label>
          {showAnexosTrigger && onOpenAnexos && (
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-md bg-sky-50 px-3 text-[12px] font-semibold text-blue-500 hover:bg-sky-100 hover:text-blue-600"
              onClick={onOpenAnexos}
              disabled={isDisabled}
            >
              <Paperclip className="mr-2 h-4 w-4" />
              Anexos
              {anexosCount > 0 && (
                <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-semibold text-blue-100">
                  {anexosCount}
                </span>
              )}
            </Button>
          )}
        </div>
        {errors.DescricaoCompleta && (
          <p className="text-sm text-destructive">
            {errors.DescricaoCompleta.message as string}
          </p>
        )}
      </div>
      <Textarea
        id="description"
        placeholder="Descreva detalhadamente o caso, incluindo contexto, passos para reproduzir e comportamento esperado..."
        className="min-h-[244px]  rounded-lg border-border-input px-[17px] py-[13px]"
        {...register("DescricaoCompleta")}
        disabled={isDisabled}
      />
    </div>
  );
}
