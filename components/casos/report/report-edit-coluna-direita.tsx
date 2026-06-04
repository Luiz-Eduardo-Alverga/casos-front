"use client";

import { useMemo } from "react";
import { Calendar, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CasoEditCardHeader } from "@/components/casos/edicao/caso-edit-card-header";
import { ReportEditStatusCard } from "./report-edit-status-card";
import { useVersoes } from "@/hooks/catalogos/use-versoes";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import {
  formatReportDateTimeDisplay,
  getPrimeiroClienteNome,
  getReportPrazoFromVersaoFechamento,
} from "./utils";

export interface ReportEditColunaDireitaProps {
  item: ProjetoMemoriaItem;
}

export function ReportEditColunaDireita({
  item,
}: ReportEditColunaDireitaProps) {
  const produtoId = String(item.produto?.id ?? "").trim();
  const versaoProduto = item.produto?.versao ?? "";

  const { data: versoes } = useVersoes({
    produto_id: produtoId,
    enabled: Boolean(produtoId),
  });

  const statusDescricao = item.caso?.status?.status_tipo?.trim() || "—";
  const entregue = Boolean(item.caso?.flags?.entregue);
  const dataInicio = formatReportDateTimeDisplay(
    item.report?.data_hora_incidente,
  );
  const nomeCliente = getPrimeiroClienteNome(item);
  const prazo = useMemo(
    () => getReportPrazoFromVersaoFechamento(versoes, versaoProduto),
    [versoes, versaoProduto],
  );

  return (
    <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[312px]">
      <Card className="rounded-lg bg-card shadow-card">
        <CasoEditCardHeader
          title="Dados da ocorrência"
          icon={Info}
          shrink={false}
        />
        <CardContent className="space-y-2 p-4 pt-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-text-label">
              Data de início
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {dataInicio}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-text-label">
              Nome do Cliente
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {nomeCliente}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card shadow-card">
        <CasoEditCardHeader
          title="Informações do Desenvolvimento"
          icon={Calendar}
          shrink={false}
        />
        <CardContent className="space-y-3 p-4 pt-3">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs font-semibold text-text-label">Prazo</p>
              <p className="text-sm font-semibold text-text-primary">{prazo}</p>
            </div>
            <div className="shrink-0 space-y-1">
              <p className="text-xs font-semibold text-text-label">Status</p>
              <span
                className={cn(
                  "inline-flex h-7 min-w-[5rem] items-center justify-center rounded-full px-2.5",
                  "bg-green-100 text-xs font-semibold text-green-800",
                )}
              >
                {statusDescricao}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border-divider bg-muted/30 p-3">
            <p className="text-xs font-semibold text-text-primary">Entregue</p>
            <Switch checked={entregue} disabled aria-readonly />
          </div>
        </CardContent>
      </Card>

      <ReportEditStatusCard item={item} />
    </div>
  );
}
