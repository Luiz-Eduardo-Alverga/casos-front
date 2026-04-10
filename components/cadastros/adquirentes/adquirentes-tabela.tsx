"use client";

import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import { formatDateTimePt } from "@/components/cadastros/format-display";
import type { AcquirerRow } from "@/components/cadastros/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdquirentesTabelaProps {
  rows: AcquirerRow[];
}

export function AdquirentesTabela({ rows }: AdquirentesTabelaProps) {
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
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Nome
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Logo (URL)
          </TableHead>
          <TableHead className="w-[100px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            4G
          </TableHead>
          <TableHead className="w-[160px] font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Criado em
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.id}
            className="bg-white border-t border-border-divider hover:bg-white"
          >
            <TableCell className="text-sm text-text-primary py-3 px-2.5">
              {row.name}
            </TableCell>
            <TableCell className="text-sm text-text-secondary py-3 px-2.5 max-w-[280px] truncate">
              {row.logoUrl ?? "—"}
            </TableCell>
            <TableCell className="text-center text-sm text-text-primary py-3 px-2.5">
              {row.has4g ? "Sim" : "Não"}
            </TableCell>
            <TableCell className="text-sm text-text-secondary py-3 px-2.5">
              {formatDateTimePt(row.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
