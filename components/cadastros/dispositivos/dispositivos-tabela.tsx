"use client";

import { Smartphone, SquarePen, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import { formatDatePt } from "@/components/cadastros/format-display";
import type { DeviceRow } from "@/components/cadastros/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DispositivosTabelaProps {
  rows: DeviceRow[];
  onEdit: (row: DeviceRow) => void;
  onDelete: (row: DeviceRow) => void;
}

export function DispositivosTabela({
  rows,
  onEdit,
  onDelete,
}: DispositivosTabelaProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Smartphone}
        title="Nenhum dispositivo encontrado"
        description="Ajuste a busca ou cadastre um novo dispositivo."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-white border-b border-white hover:bg-white">
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5">
            Dispositivo
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5 w-[200px] text-center">
            Data de cadastro
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5 w-[88px] text-center">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.id}
            className="bg-white border-t border-border-divider hover:bg-white"
          >
            <TableCell className="py-3 px-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <Smartphone
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="text-sm font-semibold text-text-primary truncate">
                  {row.name}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-sm font-normal text-text-primary py-3 px-2.5 text-center">
              {formatDatePt(row.createdAt)}
            </TableCell>
            <TableCell className="py-3 px-2.5 text-center">
              <div className="flex items-center justify-end gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  aria-label="Editar dispositivo"
                  onClick={() => onEdit(row)}
                >
                  <SquarePen className="h-4 w-4 text-emerald-500" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  aria-label="Excluir dispositivo"
                  onClick={() => onDelete(row)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
