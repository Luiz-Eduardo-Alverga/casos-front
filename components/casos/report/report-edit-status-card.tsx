"use client";

import { useMemo } from "react";
import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CasoEditCardHeader } from "@/components/casos/edicao/caso-edit-card-header";
import { CasoFormStatus } from "@/components/fields/caso-form-status";
import { formatReportDate } from "@/components/casos/edicao/report-analise-modal/utils";
import {
  useRelatores,
  useUsuariosProjetos,
} from "@/hooks/catalogos/use-usuarios";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import { cn } from "@/lib/utils";

interface ReportEditReadonlyFieldProps {
  label: string;
  value: string;
}

const reportReadonlyInputClassName = cn(
  "h-auto rounded-lg border-border-divider bg-muted/50 px-[17px] py-[11px]",
  "text-sm text-muted-foreground opacity-70",
);

function ReportEditReadonlyField({
  label,
  value,
}: ReportEditReadonlyFieldProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text-label">{label}</p>
      <Input
        value={value}
        readOnly
        disabled
        className={reportReadonlyInputClassName}
      />
    </div>
  );
}

export interface ReportEditStatusCardProps {
  item: ProjetoMemoriaItem;
}

export function ReportEditStatusCard({ item }: ReportEditStatusCardProps) {
  const report = item.report;

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

    if (!analiseUsuarioId) return "—";

    const usuario = usuarios?.find((u) => u.id === analiseUsuarioId);
    return usuario?.nome_suporte?.trim() || "—";
  }, [report?.analise_usuario_nome, analiseUsuarioId, usuarios]);

  const dataLimite = formatReportDate(report?.data_limite);
  const dataConclusao = formatReportDate(report?.analise_data_conclusao);

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CasoEditCardHeader
        title="Status do Report"
        icon={ClipboardList}
        shrink={false}
      />
      <CardContent className="space-y-3 p-4 pt-3">
        <CasoFormStatus
          disabled
          name="analiseStatus"
          label="Status"
          tipoStatus="REPORT"
          placeholder="Selecione o status do report..."
        />
        <ReportEditReadonlyField label="Data Limite" value={dataLimite} />
        <ReportEditReadonlyField label="Data Conclusão" value={dataConclusao} />
        <ReportEditReadonlyField
          label="Usuário Conclusão"
          value={usuarioConclusaoNome}
        />
      </CardContent>
    </Card>
  );
}
