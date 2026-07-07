"use client";

import { useMemo } from "react";
import {
  Calendar,
  CalendarClock,
  CircleDot,
  Package,
  User,
} from "lucide-react";
import { StatusBadge } from "@/components/badges/status-badge";
import { CARD_HEADER_PRESETS } from "@/lib/casos/card-header-theme";
import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "@/components/casos/edicao/caso-edit-card-header";
import { ReportEditStatusCard } from "./report-edit-status-card";
import { ReportEmptyValue } from "./report-empty-value";
import { ReportFieldBadge } from "./report-field-badge";
import { ReportInfoRow } from "./report-info-row";
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

function ReportValueText({ value }: { value: string }) {
  if (value === "Não informado" || value === "—") {
    return <ReportEmptyValue>Não informado</ReportEmptyValue>;
  }

  return (
    <span className="text-xs font-medium text-text-primary whitespace-nowrap">
      {value}
    </span>
  );
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

  const statusDescricao = item.caso?.status?.status_tipo?.trim() || "Aberto";
  const entregue = Boolean(item.caso?.flags?.entregue);
  const dataInicio = formatReportDateTimeDisplay(
    item.report?.data_hora_incidente,
  );
  const nomeCliente = getPrimeiroClienteNome(item);
  const prazo = useMemo(
    () => getReportPrazoFromVersaoFechamento(versoes, versaoProduto),
    [versoes, versaoProduto],
  );

  const dadosOcorrenciaPreset = CARD_HEADER_PRESETS.dadosOcorrencia;
  const infoDesenvolvimentoPreset = CARD_HEADER_PRESETS.infoDesenvolvimento;

  return (
    <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[312px]">
      <Card className="rounded-lg bg-card shadow-card">
        <CasoEditCardHeader
          title="Dados da ocorrência"
          icon={dadosOcorrenciaPreset.icon}
          iconClassName={dadosOcorrenciaPreset.iconClassName}
          shrink={false}
        />
        <CardContent className="px-4 pb-1 pt-0">
          <ReportInfoRow
            icon={Calendar}
            iconClassName="bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"
            label="Data de início"
          >
            <ReportValueText value={dataInicio} />
          </ReportInfoRow>
          <ReportInfoRow
            icon={User}
            iconClassName="bg-violet-50 text-violet-600"
            label="Nome do Cliente"
            showBorder={false}
          >
            <ReportValueText value={nomeCliente} />
          </ReportInfoRow>
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card shadow-card">
        <CasoEditCardHeader
          title="Informações do Desenvolvimento"
          icon={infoDesenvolvimentoPreset.icon}
          iconClassName={infoDesenvolvimentoPreset.iconClassName}
          shrink={false}
        />
        <CardContent className="px-4 pb-1 pt-0">
          <ReportInfoRow
            icon={CalendarClock}
            iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            label="Prazo"
          >
            <ReportValueText value={prazo} />
          </ReportInfoRow>
          <ReportInfoRow
            icon={CircleDot}
            iconClassName="bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400"
            label="Status"
          >
            <StatusBadge status={statusDescricao} />
          </ReportInfoRow>
          <ReportInfoRow
            icon={Package}
            iconClassName="bg-muted text-muted-foreground"
            label="Entregue"
            showBorder={false}
          >
            <ReportFieldBadge
              label={entregue ? "Sim" : "Não"}
              variant="neutral"
            />
          </ReportInfoRow>
        </CardContent>
      </Card>

      <ReportEditStatusCard item={item} />
    </div>
  );
}
