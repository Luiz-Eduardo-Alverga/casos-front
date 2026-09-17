"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRODUTO_LABELS } from "@/components/produtos/constants";

export interface ProdutoCreateHeaderProps {
  onBack: () => void;
}

export function ProdutoCreateHeader({ onBack }: ProdutoCreateHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary">
          {PRODUTO_LABELS.cadastroTitulo}
        </h1>
        <p className="text-sm text-text-secondary">
          {PRODUTO_LABELS.cadastroSubtitle}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full px-4 sm:w-auto"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        {PRODUTO_LABELS.voltar}
      </Button>
    </div>
  );
}
