"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/painel/empty-state";
import type { ClienteCasoItem } from "@/interfaces/projeto-memoria";
import { Trash2 } from "lucide-react";

export interface ClientesTableProps {
  clientes: ClienteCasoItem[];
  onAskDelete: (sequencia: number) => void;
}

export function ClientesTable({ clientes, onAskDelete }: ClientesTableProps) {
  const lista = Array.isArray(clientes) ? clientes : [];

  if (lista.length === 0) {
    return (
      <EmptyState
        imageAlt="Nenhum cliente vinculado"
        imageSrc="/images/empty-state-casos-produto.svg"
        title="Nenhum cliente vinculado"
        description="Adicione um cliente acima."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-white border-b border-white hover:bg-white">
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Cliente
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Nome
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Data solicitação
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5 w-[80px]">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lista.map((item) => (
          <TableRow
            key={item.sequencia}
            className="bg-white border-t border-border-divider hover:bg-white"
          >
            <TableCell className="py-3 px-2.5">
              <span className="text-sm text-text-primary">{item.cliente}</span>
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <span className="text-sm text-text-primary">
                {item.cliente_nome ?? "—"}
              </span>
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <span className="text-sm text-text-secondary">
                {item.data_solicitacao}
              </span>
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-destructive hover:text-destructive"
                onClick={() => onAskDelete(item.sequencia)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

