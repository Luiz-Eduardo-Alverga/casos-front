"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AuditoriaDetailDialogProps } from "./types";
import { getAuditStatusConfig } from "./utils";

export function AuditoriaDetailDialog({
  open,
  onOpenChange,
  colaborador,
}: AuditoriaDetailDialogProps) {
  if (!colaborador) return null;

  const statusConfig = getAuditStatusConfig(colaborador.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes — {colaborador.nome_suporte}</DialogTitle>
          <DialogDescription>
            {colaborador.data_producao} · {statusConfig.label}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1">
              Motivo do status
            </p>
            <p className="text-sm text-text-primary">{colaborador.motivo_status}</p>
          </div>

          {colaborador.inconsistencias.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
                Inconsistências
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-text-primary">
                {colaborador.inconsistencias.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
