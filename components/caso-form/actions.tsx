"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw, Send } from "lucide-react";
import { useCasoForm } from "./provider";
import { useFormContext } from "react-hook-form";

export function CasoFormActions() {
  const { isDisabled } = useCasoForm();
  const { reset } = useFormContext();
  
  return (
    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
      <Button
        type="button"
        variant="outline"
        onClick={() => reset()}
        className="w-full sm:w-auto"
        disabled={isDisabled}
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Limpar Formulário
      </Button>
      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={isDisabled}
      >
        <Send className="h-4 w-4 mr-2" />
        {isDisabled ? "Criando caso..." : "Abrir caso"}
      </Button>
    </div>
  );
}
