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
} from "@/components/caso-form";
import { Package, Users } from "lucide-react";
import { CasoResumoStatusActions } from "@/components/caso-resumo-modal/caso-resumo-status-actions";

export interface CasoEditColunaDireitaProps {
  /** ID do status retornado pela API (não o valor atual do formulário). */
  statusIdApi: number;
  /** ID do caso na rota / query `projeto-memoria`. */
  memoriaQueryId: string;
  /** Invalidar dados após atualizar status. */
  onStatusUpdated: () => void;
}

export function CasoEditColunaDireita({
  statusIdApi,
  memoriaQueryId,
  onStatusUpdated,
}: CasoEditColunaDireitaProps) {
  return (
    <div className="w-full lg:w-[362px] flex flex-col gap-6 shrink-0">
      <Card className="bg-card shadow-card rounded-lg">
        <CardContent className="p-6 pt-3">
          <CasoResumoStatusActions
            statusIdApi={statusIdApi}
            memoriaQueryId={memoriaQueryId}
            onStatusUpdated={onStatusUpdated}
          />
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
          <CasoFormVersao todas={false} />
          <CasoFormModulo required={false} />
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
