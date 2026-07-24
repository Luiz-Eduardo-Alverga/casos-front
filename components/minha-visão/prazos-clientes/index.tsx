"use client";

import { Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/painel/empty-state";
import { cn } from "@/lib/utils";
import { isEntregue } from "@/components/minha-visão/utils";
import { PrazosClientesSkeleton } from "./prazos-clientes-skeleton";
import type { VisaoPrazosClientesItem } from "@/services/sprint/get-visao-prazos-clientes";

interface PrazosClientesProps {
  data: VisaoPrazosClientesItem[];
  isLoading?: boolean;
}

export function PrazosClientes({ data, isLoading = false }: PrazosClientesProps) {
  if (isLoading) {
    return <PrazosClientesSkeleton />;
  }

  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="p-4 pb-2 border-b border-border-divider flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          <Flag className="h-3.5 w-3.5 text-text-primary shrink-0" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Prazos de clientes
          </CardTitle>
        </div>
        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-muted text-text-secondary">
          {data.length}
        </span>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <EmptyState
            title="Nenhum prazo pendente"
            description="Não há prazos de clientes com os filtros selecionados."
            className="py-8"
          />
        ) : (
          data.map((item, idx) => {
            const entregue = isEntregue(item.entregue);
            return (
              <div
                key={`${item.cliente_id}-${idx}`}
                className="px-4 py-2.5 flex items-center justify-between gap-2 border-b border-border-divider last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium text-text-primary truncate">
                    {item.cliente_nome}
                  </div>
                  <div className="text-[11px] text-text-secondary truncate">
                    {item.produto} · {item.versao_produto || "—"}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div
                    className={cn(
                      "text-[11px] font-semibold",
                      entregue ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {item.prazo_conclusao}
                  </div>
                  <div
                    className={cn(
                      "text-[10px] font-semibold uppercase",
                      entregue ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {entregue ? "entregue" : "não entregue"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export { PrazosClientesSkeleton } from "./prazos-clientes-skeleton";
