"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "./caso-edit-card-header";
import { CasoFormImportancia } from "@/components/fields/caso-form-importancia";
import { CasoFormOrigem } from "@/components/fields/caso-form-origem";
import { CasoFormCategoria } from "@/components/fields/caso-form-categoria";
import { CasoFormRelator } from "@/components/fields/caso-form-relator";
import { CARD_HEADER_PRESETS } from "@/lib/casos/card-header-theme";

/**
 * Card Classificação e Origem – visível em todas as abas exceto Anotações.
 */
export function CasoEditCardClassificacao() {
  const classificacaoPreset = CARD_HEADER_PRESETS.classificacaoOrigem;

  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CasoEditCardHeader
        title="Classificação e Origem"
        icon={classificacaoPreset.icon}
        iconClassName={classificacaoPreset.iconClassName}
        shrink={false}
      />
      <CardContent className="p-6 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <CasoFormImportancia tipo="CASO" />
          <CasoFormOrigem />
          <CasoFormCategoria />
          <CasoFormRelator />
        </div>
      </CardContent>
    </Card>
  );
}
