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
  onAvaliar: (item: PainelIdeiaItem) => void;
}

const HEADER_ROW_CLASS =
  "bg-background border-b border-background dark:border-card hover:bg-background";

export function MelhoriasTabelaTable({
  itens,
  onAvaliar,
}: MelhoriasTabelaTableProps) {
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
          <TableHead className="min-w-[150px] w-[170px] font-medium text-sm text-text-primary h-auto py-4 px-2">
            Situação
          </TableHead>
          <TableHead className="w-[108px] min-w-[108px] font-medium text-sm text-text-primary h-auto py-4 px-2">
            Ação
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {itens.map((item) => (
          <MelhoriasTabelaRow
            key={item.registro}
            item={item}
            onAvaliar={onAvaliar}
          />
        ))}
      </TableBody>
    </Table>
  );
}
