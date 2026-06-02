"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PRIORIDADE_AJUDA = [
  {
    titulo: "1 — CRÍTICO",
    descricao: "Sistema inoperante ou faturamento parado",
    sla: "Até 30 minutos",
  },
  {
    titulo: "2 - ALTO",
    descricao: "Funcionalidade chave quebrada, porém sem operação parada",
    sla: "2hs a 1 dia útil",
  },
  {
    titulo: "3 - MÉDIO",
    descricao: "Comportamento inesperado ou erro visual",
    sla: "2 a 4 dias úteis",
  },
  {
    titulo: "4 - BAIXO",
    descricao: "Ajuste ou refinamento de alguma tela/funcionalidade",
    sla: "4 a 7 dias úteis",
  },
];

export function ReportPrioridadeSlaCard() {
  return (
    <Card className="rounded-lg border border-yellow-200 bg-yellow-50 shadow-card">
      <CardHeader className="border-b border-yellow-200 p-4 pb-2">
        <CardTitle className="text-xs font-semibold uppercase leading-tight text-yellow-800">
          ⚡ Níveis de prioridade / SLA - início análise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-3">
        {PRIORIDADE_AJUDA.map((item) => (
          <div
            key={item.titulo}
            className="space-y-0.5 border-b border-yellow-200 pb-2 last:border-b-0 last:pb-0"
          >
            <p className="text-sm font-semibold text-yellow-700">{item.titulo}</p>
            <p className="text-xs leading-snug text-yellow-900">{item.descricao}</p>
            <p className="text-xs text-yellow-700">› SLA: {item.sla}</p>
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
  );
}
