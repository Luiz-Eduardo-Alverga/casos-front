"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ProjetoCreateHeaderProps {
  onBack: () => void;
}

export function ProjetoCreateHeader({ onBack }: ProjetoCreateHeaderProps) {
  return (
    <div className="mb-3 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary">
          Adicionar Novo Projeto
        </h1>
        <p className="text-sm text-text-secondary">
          Preencha os campos abaixo para criar um novo projeto
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full px-4 sm:w-auto"
        onClick={onBack}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar
      </Button>
    </div>
  );
}
