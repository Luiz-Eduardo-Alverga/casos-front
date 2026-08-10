"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { MelhoriasTabelaRow } from "@/components/melhorias/tabela/melhorias-tabela-row";
import type { PainelIdeiaItem } from "@/services/painel-ideias/get-painel-ideias";

interface MelhoriasTabelaTableProps {
  itens: PainelIdeiaItem[];
}

const HEADER_ROW_CLASS =
  "bg-background border-b border-background dark:border-card hover:bg-background";

export function MelhoriasTabelaTable({ itens }: MelhoriasTabelaTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className={HEADER_ROW_CLASS}>
          <TableHead className="min-w-[95px] font-medium text-sm text-text-primary h-auto py-4 px-2">
            Registro
          </TableHead>
          <TableHead className="min-w-0 flex-1 font-medium text-sm text-text-primary h-auto py-4 px-2">
            Detalhes
          </TableHead>
          <TableHead className="min-w-[140px] w-[160px] font-medium text-sm text-text-primary h-auto py-4 px-2">
            Situação
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {itens.map((item) => (
          <MelhoriasTabelaRow key={item.registro} item={item} />
        ))}
      </TableBody>
    </Table>
  );
}
