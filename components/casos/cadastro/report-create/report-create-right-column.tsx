"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export interface ReportCreateRightColumnProps {
  isSubmitting: boolean;
  isCreating: boolean;
}

const PRIORIDADE_AJUDA = [
  {
    titulo: "1 - CRÍTICO",
    descricao: "Sistema inoperante ou faturamento parado",
  },
  {
    titulo: "2 - ALTO",
    descricao: "Funcionalidade quebrada, porém sem operação parada",
  },
  {
    titulo: "3 - MÉDIO",
    descricao: "Comportamento inesperado ou erro visual",
  },
  {
    titulo: "4 - BAIXO",
    descricao: "Ajuste ou refinamento de alguma tela/funcionalidade",
  },
];

export function ReportCreateRightColumn({
  isSubmitting,
  isCreating,
}: ReportCreateRightColumnProps) {
  return (
    <div className="flex w-full flex-col gap-4 lg:w-[292px]">
      <Card className="rounded-lg border border-yellow-200 bg-yellow-50 shadow-card">
        <CardHeader className="border-b border-yellow-200 p-4 pb-2">
          <CardTitle className="text-xs font-semibold uppercase leading-tight text-yellow-800">
            ⚡ Níveis de prioridade / SLA - início análise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-3">
          {PRIORIDADE_AJUDA.map((item) => (
            <div key={item.titulo} className="space-y-0.5 border-b border-yellow-200 pb-2 last:border-b-0 last:pb-0">
              <p className="text-sm font-semibold text-yellow-700">
                {item.titulo}
              </p>
              <p className="text-xs leading-snug text-yellow-900">{item.descricao}</p>
              <p className="text-xs text-yellow-700">› SLA: 2 a 7 dias úteis</p>
            </div>
          ))}

          <div className="space-y-1 border-t border-yellow-200 pt-2">
            <p className="text-sm font-semibold text-red-700">
              ⚠ Recomendações importantes:
            </p>
            <p className="text-xs leading-snug text-red-700">
              Aplicar contorno sempre que possível para destravar operação do cliente.
              No caso de report CRÍTICO avaliado como &quot;sem solução de contorno&quot;,
              comunique imediatamente via Discord para agilizar o início da análise.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-border-accent bg-gradient-to-br from-bg-accent-start to-bg-accent-end p-4">
        <Button type="submit" className="w-full" disabled={isCreating || isSubmitting}>
          <Check className="h-3.5 w-3.5" />
          {isCreating || isSubmitting ? "Abrindo Report..." : "Abrir Report"}
        </Button>
      </div>
    </div>
  );
}
