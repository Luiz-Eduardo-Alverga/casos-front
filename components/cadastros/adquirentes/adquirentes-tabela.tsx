"use client";

import { Building2, SquarePen, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import type { AcquirerListExpandedItem } from "@/components/cadastros/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAcquirerStatusDotClass } from "./adquirentes-shared";
import { AcquirerLogo } from "./acquirer-logo";
import { AcquirerDevicesBadges } from "./acquirer-devices-badges";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MAX_INLINE_DEVICES = 5;

function DevicesCell({ row }: { row: AcquirerListExpandedItem }) {
  return (
    <AcquirerDevicesBadges devices={row.compatibleDevices} maxInline={MAX_INLINE_DEVICES} />
  );
}

interface AdquirentesTabelaProps {
  rows: AcquirerListExpandedItem[];
  onEdit?: (row: AcquirerListExpandedItem) => void;
  onDelete?: (row: AcquirerListExpandedItem) => void;
}

export function AdquirentesTabela({
  rows,
  onEdit,
  onDelete,
}: AdquirentesTabelaProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Nenhum adquirente encontrado"
        description="Ajuste a busca ou cadastre um novo adquirente."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-white border-b border-white hover:bg-white">
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5">
            Adquirente
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5 w-[100px]">
            Versão
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5 min-w-[140px]">
            Status
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5 w-[100px]">
            Próxima
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5 min-w-[200px]">
            Dispositivos
          </TableHead>
          {(onEdit || onDelete) && (
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5 w-[72px] text-center">
              Ações
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const a = row.acquirer;
          return (
            <TableRow
              key={a.id}
              className="bg-white border-t border-border-divider hover:bg-white"
            >
              <TableCell className="py-3 px-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <AcquirerLogo name={a.name} logoUrl={a.logoUrl} />
                  <span className="text-sm font-medium text-text-primary truncate">
                    {a.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-text-primary py-3 px-2.5">
                {row.currentVersionName ?? "—"}
              </TableCell>
              <TableCell className="py-3 px-2.5">
                {row.status ? (
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        getAcquirerStatusDotClass(row.status),
                      )}
                      aria-hidden
                    />
                    <span className="text-sm text-text-primary">
                      {row.status}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-text-primary py-3 px-2.5">
                {row.nextVersionName ?? "—"}
              </TableCell>
              <TableCell className="py-3 px-2.5">
                <DevicesCell row={row} />
              </TableCell>
              {(onEdit || onDelete) && (
                <TableCell className="py-3 px-2.5 text-center">
                  <div className="flex items-center justify-end gap-1">
                    {onEdit && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        aria-label="Editar adquirente"
                        onClick={() => onEdit(row)}
                      >
                        <SquarePen className="h-4 w-4 text-emerald-500" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label="Excluir adquirente"
                        onClick={() => onDelete(row)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
