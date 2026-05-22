"use client";

import {
  Calendar,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock,
  Clock1,
  FileText,
  Plus,
  RefreshCw,
  SquarePen,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SgpCronogramaItem } from "@/interfaces/sgp-cronograma";
import { CronogramaPapelBadge } from "@/components/projetos/edicao/cronograma/cronograma-papel-badge";
import {
  formatCronogramaHoraPrevista,
  formatCronogramaPeriodo,
  resolveCronogramaStatus,
  type CronogramaTarefaStatus,
} from "@/components/projetos/edicao/cronograma/utils";
import { cn } from "@/lib/utils";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";

export interface CronogramaTarefaCardProps {
  item: SgpCronogramaItem;
  titulo: string;
  papelLabel: string;
  onEditar: (tarefa: SgpCronogramaItem) => void;
  onExcluir: (tarefa: SgpCronogramaItem) => void;
  onConcluir: (tarefa: SgpCronogramaItem) => void;
}

const STATUS_CONFIG: Record<
  CronogramaTarefaStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  concluido: {
    label: "Concluído",
    className: "text-emerald-600",
    icon: CheckCircle2,
  },
  em_andamento: {
    label: "Em andamento",
    className: "text-sky-600",
    icon: RefreshCw,
  },
  pendente: {
    label: "Pendente",
    className: "text-amber-600",
    icon: Clock1,
  },
};

export function CronogramaTarefaCard({
  item,
  titulo,
  papelLabel,
  onEditar,
  onExcluir,
  onConcluir,
}: CronogramaTarefaCardProps) {
  const rbacReady = permissionsLoaded();
  const canEdit = !rbacReady || hasPermission("edit-project");
  const status = resolveCronogramaStatus(item);
  const statusCfg = STATUS_CONFIG[status];
  const StatusIcon = statusCfg.icon;
  const responsavel = item.objetivo_quem?.trim() || "—";
  const observacao = item.observacao?.trim();

  return (
    <article className="flex flex-col rounded-lg border border-border-divider justify-between bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <CronogramaPapelBadge idPapel={item.id_papel} label={papelLabel} />
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 px-1"
            disabled={!canEdit}
            aria-label="Editar tarefa"
            onClick={() => onEditar(item)}
          >
            <SquarePen className="h-4 w-4 text-text-secondary" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 px-1 text-destructive"
            disabled={!canEdit}
            aria-label="Excluir tarefa"
            onClick={() => onExcluir(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <h3 className="mt-3 text-sm font-semibold leading-5 text-text-primary">
        {titulo}
      </h3>

      <div className="mt-3 space-y-2 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{responsavel}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{formatCronogramaHoraPrevista(item.hora_prevista)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {formatCronogramaPeriodo(item.data_inicio, item.data_termino)}
          </span>
        </div>
      </div>

      {observacao ? (
        <div className="mt-3 flex items-start gap-2 text-xs leading-4 text-text-secondary">
          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{observacao}</span>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border-divider pt-3">
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium",
            statusCfg.className,
          )}
        >
          <StatusIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {statusCfg.label}
        </div>
        {!item.concluido && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            disabled={!canEdit}
            aria-label="Concluir tarefa"
            onClick={() => onConcluir(item)}
          >
            <Plus className="h-4 w-4 text-text-secondary" />
          </Button>
        )}
      </div>
    </article>
  );
}
