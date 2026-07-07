"use client";

import { ExternalLink, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AuditoriaColaboradorRowProps } from "./types";
import { getAuditStatusConfig } from "./utils";

export function AuditoriaColaboradorRow({
  colaborador,
  projetoLabel,
  onOpenDetail,
}: AuditoriaColaboradorRowProps) {
  const statusConfig = getAuditStatusConfig(colaborador.status);
  const StatusIcon = statusConfig.icon;

  return (
    <TableRow className="bg-table-row-bg border-t border-border-divider hover:bg-table-row-hover">
      <TableCell className="py-3 w-[220px] px-6">
        <div className="flex items-center gap-2 min-w-[180px]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-accent bg-bg-accent-start">
            <User className="h-3.5 w-3.5 text-gradient-start" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {colaborador.nome_suporte}
            </p>
            <p className="text-xs text-text-secondary truncate">
              {projetoLabel || "—"}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-3 px-6 w-[220px]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-primary">
              {colaborador.total_horas}
            </span>
            <StatusIcon
              className={cn("h-4 w-4 shrink-0", statusConfig.textClass)}
              aria-hidden
            />
          </div>
          <span className="text-xs text-text-secondary">
            {colaborador.janela_trabalho}
          </span>
        </div>
      </TableCell>

      <TableCell className="py-3 px-6 w-[280px]">
        <div className="flex flex-col gap-1.5">
          <Progress
            value={colaborador.percentual_tecnico}
            className="h-3 bg-gradient-start/15 [&>div]:bg-gradient-start"
          />
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-text-secondary">
              Técnico{" "}
              <span className="font-bold text-text-primary">
                {colaborador.horas_tecnicas}
              </span>
            </span>
            <span className="text-text-secondary">
              Não-Técnico{" "}
              <span className="font-bold text-text-primary">
                {colaborador.horas_nao_tecnicas}
              </span>
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-3 px-6 w-[200px]">
        <Badge
          className={cn(
            "rounded-md px-3 py-1 text-xs font-bold uppercase",
            statusConfig.badgeClass,
          )}
        >
          {statusConfig.label}
        </Badge>
      </TableCell>

      <TableCell className="py-3 px-6 w-[80px]">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={`Ver detalhes de ${colaborador.nome_suporte}`}
          onClick={() => onOpenDetail(colaborador)}
        >
          <ExternalLink className="h-4 w-4 text-text-secondary" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
