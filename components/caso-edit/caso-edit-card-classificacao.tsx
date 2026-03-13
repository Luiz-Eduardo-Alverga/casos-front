"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "./caso-edit-card-header";
import {
  CasoFormImportancia,
  CasoFormOrigem,
  CasoFormCategoria,
  CasoFormRelator,
} from "@/components/caso-form";
import { Bug } from "lucide-react";

export interface CasoEditCardClassificacaoProps {
  casoId: number;
}

/**
 * Card Classificação e Origem – visível em todas as abas exceto Anotações.
 */
export function CasoEditCardClassificacao({ casoId }: CasoEditCardClassificacaoProps) {
  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CasoEditCardHeader title="Classificação e Origem" icon={Bug} badge={casoId} shrink={false} />
      <CardContent className="p-6 pt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px]">
          <CasoFormImportancia />
          <CasoFormOrigem />
          <CasoFormCategoria />
          <CasoFormRelator />
        </div>
      </CardContent>
    </Card>
  );
}
