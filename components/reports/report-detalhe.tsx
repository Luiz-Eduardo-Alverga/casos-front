"use client";

import {
  Check,
  AlertTriangle,
  X,
  Clock,
  Box,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/badges/status-badge";
import { EmptyState } from "@/components/painel/empty-state";
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

interface ReportDetalheProps {
  data: ReportCardData | null;
  onAprovar: () => void;
  onMarcarIncompleto: () => void;
  onSuspender: () => void;
  onVerCaso: () => void;
  disabled?: boolean;
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
  return nome.slice(0, 2).toUpperCase() || "?";
}

interface PessoaInfoProps {
  label: string;
  nome: string;
}

function PessoaInfo({ label, nome }: PessoaInfoProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </span>
      <div className="flex items-center gap-2 min-w-0">
        {/* <Avatar className="h-7 w-7 shrink-0 rounded-full bg-blue-100 border-0">
          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
            {nome !== "—" ? iniciais(nome) : "?"}
          </AvatarFallback>
        </Avatar> */}
        <span className="truncate text-sm font-medium text-text-primary">
          {nome}
        </span>
      </div>
    </div>
  );
}

export function ReportDetalhe({
  data,
  onAprovar,
  onMarcarIncompleto,
  onSuspender,
  onVerCaso,
  disabled = false,
}: ReportDetalheProps) {
  if (!data) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border-divider bg-card shadow-card">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6">
          <EmptyState
            imageSrc="/images/empty-state-casos-produto.svg"
            title="Selecione um report"
            description="Clique em um report na tabela para visualizar os detalhes."
            className="mt-8"
          />
        </div>
      </div>
    );
  }

  const prioridadeStyle = getPrioridadeStyle(data.prioridade);
  const sla = getReportSlaInfo(data.dataLimite);
  const acoesDesabilitadas = data.statusId === 8;

  const limiteLabel = data.dataLimite
    ? `Limite ${formatDataAbertura(data.dataLimite).split(" ")[0]}`
    : null;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border-divider bg-card shadow-card">
      <span
        className={cn("absolute inset-x-0 top-0 h-1", prioridadeStyle.border)}
        aria-hidden
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-5 overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <ReportIdBadge id={data.id} />
            <ReportCategoriaBadge categoria={data.categoria} />
            <ReportPrioridadeBadge prioridade={data.prioridade} />
            {data.status?.trim() ? <StatusBadge status={data.status} /> : null}
          </div>

          {sla.hasLimite ? (
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span
                className={cn(
                  "inline-flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium",
                  getSlaSeverityStyle(sla.severity),
                )}
              >
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {sla.label}
              </span>
              {limiteLabel ? (
                <span className="text-xs text-text-secondary pl-0.5">
                  {limiteLabel}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <h3 className="text-sm font-semibold text-text-primary shrink-0">
          {data.descricaoResumo}
        </h3>

        <div className="grid grid-cols-3 gap-4 shrink-0">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Produto
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <Box className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
              <span className="truncate text-sm font-medium text-text-primary">
                {data.produtoNome}
              </span>
            </div>
          </div>
          <PessoaInfo label="Relator" nome={data.relatorNome} />
          <PessoaInfo label="Responsável" nome={data.responsavelNome} />
        </div>

        {data.descricaoCompleta ? (
          <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary shrink-0">
              Descrição
            </span>
            <p className="min-h-0 flex-1 overflow-y-auto text-sm text-text-primary font-semibold whitespace-pre-wrap [overflow-wrap:anywhere]">
              {data.descricaoCompleta}
            </p>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-border-divider pt-4 shrink-0 mt-auto">
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
    </div>
  );
}
