"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { CalendarCheck, CircleDot, Clock, User } from "lucide-react";
import { CARD_HEADER_PRESETS } from "@/lib/casos/card-header-theme";
import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "@/components/casos/edicao/caso-edit-card-header";
import { formatReportDate } from "@/components/casos/edicao/report-analise-modal/utils";
import { useRelatores } from "@/hooks/catalogos/use-usuarios";
import { useStatus } from "@/hooks/catalogos/use-status";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import { cn } from "@/lib/utils";
import { ReportEmptyValue } from "./report-empty-value";
import { ReportFieldBadge } from "./report-field-badge";
import { ReportInfoRow } from "./report-info-row";
import type { ReportEditFormData } from "./schema";

export interface ReportEditStatusCardProps {
  item: ProjetoMemoriaItem;
}

export function ReportEditStatusCard({ item }: ReportEditStatusCardProps) {
  const report = item.report;
  const { watch } = useFormContext<ReportEditFormData>();

  const analiseStatusForm = String(watch("analiseStatus") ?? "").trim();
  const analiseStatusApi = String(report?.analise_status ?? "").trim();
  const analiseStatusId = analiseStatusForm || analiseStatusApi;

  const { data: statusList } = useStatus();

  const statusReportLabel = useMemo(() => {
    if (!analiseStatusId || analiseStatusId === "0") {
      return "Não definido";
    }

    const itemStatus = (statusList ?? []).find(
      (s) =>
        String(s.Registro) === analiseStatusId && s.tipo_status === "REPORT",
    );
    return itemStatus?.tipo?.trim() || analiseStatusId;
  }, [analiseStatusId, statusList]);

  const analiseUsuarioId = String(
    report?.report_analise_usuario_id ?? "",
  ).trim();
  const precisaResolverUsuario =
    Boolean(analiseUsuarioId) && !report?.analise_usuario_nome?.trim();

  const { data: usuarios } = useRelatores({
    enabled: precisaResolverUsuario,
  });

  const usuarioConclusaoNome = useMemo(() => {
    const nomeApi = report?.analise_usuario_nome?.trim();
    if (nomeApi) return nomeApi;

    if (!analiseUsuarioId) return null;

    const usuario = usuarios?.find((u) => u.id === analiseUsuarioId);
    return usuario?.nome_suporte?.trim() || null;
  }, [report?.analise_usuario_nome, analiseUsuarioId, usuarios]);

  const dataLimiteRaw = formatReportDate(report?.data_limite);
  const dataConclusaoRaw = formatReportDate(report?.analise_data_conclusao);

  const dataLimite = dataLimiteRaw === "—" ? null : dataLimiteRaw;
  const dataConclusao = dataConclusaoRaw === "—" ? null : dataConclusaoRaw;

  const statusReportPreset = CARD_HEADER_PRESETS.statusReport;

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CasoEditCardHeader
        title="Status do Report"
        icon={statusReportPreset.icon}
        iconClassName={statusReportPreset.iconClassName}
        shrink={false}
      />
      <CardContent className="px-4 pb-1 pt-0">
        <ReportInfoRow
          icon={CircleDot}
          iconClassName="bg-muted text-muted-foreground"
          label="Status"
        >
          <ReportFieldBadge label={statusReportLabel} variant="report" />
        </ReportInfoRow>

        <ReportInfoRow
          icon={Clock}
          iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
          label="Data Limite"
        >
          {dataLimite ? (
            <span
              className={cn(
                "inline-flex rounded-md border border-border-divider",
                "bg-muted/50 px-2.5 py-1 text-xs font-semibold text-text-primary whitespace-nowrap",
              )}
            >
              {dataLimite}
            </span>
          ) : (
            <ReportEmptyValue>Não informado</ReportEmptyValue>
          )}
        </ReportInfoRow>

        <ReportInfoRow
          icon={CalendarCheck}
          iconClassName="bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400"
          label="Data Conclusão"
        >
          {dataConclusao ? (
            <span className="text-xs font-medium text-text-primary whitespace-nowrap">
              {dataConclusao}
            </span>
          ) : (
            <ReportEmptyValue>Não concluído</ReportEmptyValue>
          )}
        </ReportInfoRow>

        <ReportInfoRow
          icon={User}
          iconClassName="bg-violet-50 text-violet-600"
          label="Usuário Conclusão"
          showBorder={false}
        >
          {usuarioConclusaoNome ? (
            <span className="text-xs font-medium text-text-primary whitespace-nowrap">
              {usuarioConclusaoNome}
            </span>
          ) : (
            <ReportEmptyValue>Não atribuído</ReportEmptyValue>
          )}
        </ReportInfoRow>
      </CardContent>
    </Card>
  );
}
