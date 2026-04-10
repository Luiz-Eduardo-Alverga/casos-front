"use client";

import { GitBranch } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import { formatDateTimePt } from "@/components/cadastros/format-display";
import type { VersionRow } from "@/components/cadastros/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VersoesTabelaProps {
  rows: VersionRow[];
}

export function VersoesTabela({ rows }: VersoesTabelaProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={GitBranch}
        title="Nenhuma versão encontrada"
        description="Ajuste a busca ou cadastre uma nova versão."
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
          <TableHead className="min-w-[280px] font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            ID
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
              {row.name?.trim() ? row.name : "—"}
            </TableCell>
            <TableCell className="text-xs font-mono text-text-secondary py-3 px-2.5 break-all">
              {row.id}
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
