"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CasoFormProduto,
  CasoFormVersao,
  CasoFormProjeto,
  CasoFormModulo,
  CasoFormDevAtribuido,
  CasoFormQaAtribuido,
  CasoFormStatus,
} from "@/components/caso-form";
import { Package, Users, CircleDot } from "lucide-react";

/**
 * Coluna direita fixa em todas as abas (Status, Dados do Produto, Atribuição).
 * Conforme Figma 181-1582.
 */
export function CasoEditColunaDireita() {
  return (
    <div className="w-full lg:w-[362px] flex flex-col gap-6 shrink-0">
      <Card className="bg-card shadow-card rounded-lg">
        {/* <CardHeader className="p-5 pb-2 border-b border-border-divider">
          <div className="flex items-center gap-2">
            <CircleDot className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Status
            </CardTitle>
          </div>
        </CardHeader> */}
        <CardContent className="p-6 pt-3">
          <CasoFormStatus />
        </CardContent>
      </Card>

      <Card className="bg-card shadow-card rounded-lg">
        <CardHeader className="p-5 pb-2 border-b border-border-divider">
          <div className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Dados do Produto
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3 space-y-4">
          <CasoFormProduto />
          <CasoFormVersao />
          <CasoFormModulo />
          <CasoFormProjeto />
        </CardContent>
      </Card>

      <Card className="bg-card shadow-card rounded-lg">
        <CardHeader className="p-5 pb-2 border-b border-border-divider">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Atribuição
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3 space-y-4">
          <CasoFormDevAtribuido />
          <CasoFormQaAtribuido />
        </CardContent>
      </Card>
    </div>
  );
}
