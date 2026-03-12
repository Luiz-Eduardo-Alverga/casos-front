"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CasoFormImportancia,
  CasoFormOrigem,
  CasoFormCategoria,
  CasoFormRelator,
} from "@/components/caso-form";
import { Bug } from "lucide-react";

/**
 * Card Classificação e Origem – visível em todas as abas exceto Anotações.
 * Conforme Figma 181-1582.
 */
export function CasoEditCardClassificacao() {
  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="p-5 pb-2 border-b border-border-divider">
        <div className="flex items-center gap-2">
          <Bug className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Classificação e Origem
          </CardTitle>
        </div>
      </CardHeader>
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
