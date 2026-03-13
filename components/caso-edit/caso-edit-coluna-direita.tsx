"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "./caso-edit-card-header";
import {
  CasoFormProduto,
  CasoFormVersao,
  CasoFormProjeto,
  CasoFormModulo,
  CasoFormDevAtribuido,
  CasoFormQaAtribuido,
  CasoFormStatus,
} from "@/components/caso-form";
import { Package, Users } from "lucide-react";

export interface CasoEditColunaDireitaProps {
  casoId: number;
}

/**
 * Coluna direita fixa em todas as abas (Status, Dados do Produto, Atribuição).
 */
export function CasoEditColunaDireita({ casoId }: CasoEditColunaDireitaProps) {
  return (
    <div className="w-full lg:w-[362px] flex flex-col gap-6 shrink-0">
      <Card className="bg-card shadow-card rounded-lg">
        <CardContent className="p-6 pt-3">
          <CasoFormStatus />
        </CardContent>
      </Card>

      <Card className="bg-card shadow-card rounded-lg">
        <CasoEditCardHeader
          title="Dados do Produto"
          icon={Package}
          shrink={false}
        />
        <CardContent className="p-6 pt-3 space-y-4">
          <CasoFormProduto />
          <CasoFormVersao />
          <CasoFormModulo />
          <CasoFormProjeto />
        </CardContent>
      </Card>

      <Card className="bg-card shadow-card rounded-lg">
        <CasoEditCardHeader title="Atribuição" icon={Users} shrink={false} />
        <CardContent className="p-6 pt-3 space-y-4">
          <CasoFormDevAtribuido />
          <CasoFormQaAtribuido />
        </CardContent>
      </Card>
    </div>
  );
}
