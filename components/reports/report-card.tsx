"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  Check,
  AlertTriangle,
  X,
  Clock,
  Box,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/badges/status-badge";
import type { ReportCardData } from "./types";
import {
  getPrioridadeStyle,
  getReportSlaInfo,
  getSlaSeverityStyle,
  formatDataAbertura,
} from "./utils";
import {
  ReportCategoriaBadge,
  ReportIdBadge,
  ReportPrioridadeBadge,
} from "./report-badges";

interface ReportCardProps {
  data: ReportCardData;
  onAprovar: () => void;
  onMarcarIncompleto: () => void;
  onSuspender: () => void;
  onVerCaso: () => void;
  disabled?: boolean;
}

interface InfoItemProps {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

function InfoItem({ label, value, icon: Icon }: InfoItemProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-text-secondary">{label}</span>
      <div className="flex items-center gap-1.5">
        {Icon ? (
          <Icon className="h-3 w-3 shrink-0 text-text-secondary" />
        ) : null}
        <span className="truncate text-sm font-medium text-text-primary">
          {value}
        </span>
      </div>
    </div>
  );
}

export function ReportCard({
  data,
  onAprovar,
  onMarcarIncompleto,
  onSuspender,
  onVerCaso,
  disabled = false,
}: ReportCardProps) {
  const prioridadeStyle = getPrioridadeStyle(data.prioridade);
  const sla = getReportSlaInfo(data.dataLimite);
  const acoesDesabilitadas = data.statusId === 8;

  const descricaoRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);

  useLayoutEffect(() => {
    const el = descricaoRef.current;
    if (!el) return;
    if (expanded) return;
    setIsClamped(el.scrollHeight > el.clientHeight + 1);
  }, [expanded, data.descricaoCompleta]);

  return (
    <div className="relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border-divider bg-card shadow-card">
      <span
        className={cn("absolute inset-y-0 left-0 w-1", prioridadeStyle.border)}
        aria-hidden
      />

      <div className="flex flex-col gap-3 p-5 pl-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <ReportIdBadge id={data.id} />
            <ReportPrioridadeBadge prioridade={data.prioridade} />
            <ReportCategoriaBadge categoria={data.categoria} />

            {data.status?.trim() ? <StatusBadge status={data.status} /> : null}
          </div>

          {sla.hasLimite ? (
            <div className="flex flex-col items-end gap-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
                  getSlaSeverityStyle(sla.severity),
                )}
              >
                <Clock className="h-3 w-3 shrink-0" />
                {sla.label}
              </span>
              <span className="text-xs text-text-secondary">
                {formatDataAbertura(data.dataLimite)}
              </span>
            </div>
          ) : null}
        </div>

        <h3 className="text-base font-semibold text-text-primary">
          {data.descricaoResumo}
        </h3>

        {data.descricaoCompleta ? (
          <div className="flex flex-col items-start gap-1">
            <p
              ref={descricaoRef}
              className={cn(
                "text-sm text-text-secondary",
                !expanded && "line-clamp-2",
              )}
            >
              {data.descricaoCompleta}
            </p>
            {isClamped || expanded ? (
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs font-medium text-text-primary hover:underline"
              >
                {expanded ? (
                  <>
                    Ver menos
                    <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Ver mais
                    <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border-divider bg-muted/30 p-3 sm:grid-cols-4">
          <InfoItem label="Produto" value={data.produtoNome} icon={Box} />
          <InfoItem label="Relator" value={data.relatorNome} />
          <InfoItem label="Responsável" value={data.responsavelNome} />
          <InfoItem
            label="Data de Abertura"
            value={formatDataAbertura(data.dataAbertura)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border-divider pt-4">
          {!acoesDesabilitadas ? (
            <>
              <Button
                type="button"
                onClick={onAprovar}
                disabled={disabled}
                className="bg-emerald-500 text-white hover:bg-emerald-500/90"
              >
                {disabled ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Aprovar
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onMarcarIncompleto}
                disabled={disabled}
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                Marcar Incompleto
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onSuspender}
                disabled={disabled}
                className=" border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
                Suspender
              </Button>
            </>
          ) : null}

          <Button
            type="button"
            variant="outline"
            className="ml-auto"
            onClick={onVerCaso}
          >
            <ExternalLink className="h-3.5 w-3.5 " />
            Ver caso completo
          </Button>
        </div>
      </div>
    </div>
  );
}
