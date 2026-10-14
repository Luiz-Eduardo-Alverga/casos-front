"use client";

import {
  AlertTriangle,
  Box,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import {
  ReportCategoriaBadge,
  ReportIdBadge,
  ReportPrioridadeBadge,
} from "../layout/report-badges";
import {
  formatDataAbertura,
  getPrioridadeStyle,
  getReportSlaInfo,
  getSlaSeverityStyle,
  mapProjetoMemoriaToReportCard,
} from "../utils";

interface ReportListaRowProps {
  item: ProjetoMemoriaItem;
  open: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onAprovar: () => void;
  onMarcarIncompleto: () => void;
  onSuspender: () => void;
  onVerCaso: () => void;
}

export function ReportListaRow({
  item,
  open,
  disabled = false,
  onToggle,
  onAprovar,
  onMarcarIncompleto,
  onSuspender,
  onVerCaso,
}: ReportListaRowProps) {
  const data = mapProjetoMemoriaToReportCard(item);
  const prioridadeStyle = getPrioridadeStyle(data.prioridade);
  const sla = getReportSlaInfo(data.dataLimite);
  const acoesDesabilitadas = data.statusId === 8;

  return (
    <div className="relative border-t border-border-divider first:border-t-0">
      <span
        className={cn("absolute inset-y-0 left-0 w-1", prioridadeStyle.border)}
        aria-hidden
      />
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={cn(
          "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-4 pl-6 pr-4 text-left hover:bg-muted/40 sm:grid-cols-[140px_minmax(0,1fr)_auto] sm:gap-4 xl:grid-cols-[150px_minmax(0,1fr)_190px_120px_auto]",
          open && "border-b border-border-divider bg-muted/40",
        )}
      >
        <div className="col-start-1 flex min-w-0 flex-col gap-2 sm:contents">
          <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-start sm:gap-1">
            {sla.hasLimite ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium",
                  getSlaSeverityStyle(sla.severity),
                )}
              >
                <Clock className="size-3 shrink-0" aria-hidden />
                {sla.label}
              </span>
            ) : (
              <span className="text-xs text-text-secondary">Sem prazo</span>
            )}
            {sla.hasLimite ? (
              <span className="text-xs text-text-secondary">
                {formatDataAbertura(data.dataLimite)}
              </span>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <ReportIdBadge id={data.id} />
              <ReportPrioridadeBadge prioridade={data.prioridade} />
              <ReportCategoriaBadge categoria={data.categoria} />
              {data.status?.trim() ? <StatusBadge status={data.status} /> : null}
            </div>
            <span className="line-clamp-2 text-sm font-semibold text-text-primary">
              {data.descricaoResumo}
            </span>
          </div>
        </div>

        <div className="hidden min-w-0 flex-col xl:flex">
          <span className="text-xs text-text-secondary">Produto</span>
          <span className="truncate text-sm font-medium text-text-primary">
            {data.produtoNome}
          </span>
        </div>
        <div className="hidden min-w-0 flex-col xl:flex">
          <span className="text-xs text-text-secondary">Relator</span>
          <span className="truncate text-sm font-medium text-text-primary">
            {data.relatorNome}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-text-secondary transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="flex flex-col gap-4 px-6 py-4">
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-border-divider p-4 sm:grid-cols-4">
            <Fact label="Produto" value={data.produtoNome} icon={Box} />
            <Fact label="Relator" value={data.relatorNome} />
            <Fact label="Responsável" value={data.responsavelNome} />
            <Fact label="Data de Abertura" value={formatDataAbertura(data.dataAbertura)} />
          </div>

          {data.descricaoCompleta ? (
            <p className="max-h-[300px] overflow-auto whitespace-pre-line rounded-md border border-border-divider bg-muted/40 p-4 text-sm text-text-secondary">
              {data.descricaoCompleta}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 border-t border-border-divider pt-4">
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
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
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
              <ExternalLink className="h-3.5 w-3.5" />
              Ver caso completo
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Fact({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-text-primary">
        {Icon ? <Icon className="size-3.5 shrink-0 text-text-secondary" /> : null}
        <span className="truncate">{value}</span>
      </span>
    </div>
  );
}

