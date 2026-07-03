"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import type { PromptRow } from "./types";

interface PromptsIaTableProps {
  rows: PromptRow[];
  togglingId?: string | null;
  onToggle: (row: PromptRow) => void;
  onDelete: (row: PromptRow) => void;
}

export function PromptsIaTable({
  rows,
  togglingId,
  onToggle,
  onDelete,
}: PromptsIaTableProps) {
  const router = useRouter();
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Nenhum prompt encontrado"
        description="Nenhum prompt corresponde à busca ou ainda não há prompts cadastrados."
        className="min-h-[260px]"
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[35%]">Nome</TableHead>
          <TableHead className="w-[25%]">Squad</TableHead>
          <TableHead className="w-[15%]">Status</TableHead>
          <TableHead className="w-[25%] text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const isDefault = row.squadSetor === null;
          const isToggling = togglingId === row.id;

          return (
            <TableRow key={row.id}>
              <TableCell className="py-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary">
                    {row.name}
                  </span>
                  {isDefault && (
                    <Badge variant="secondary" className="rounded-full text-xs">
                      DEFAULT
                    </Badge>
                  )}
                </div>
              </TableCell>

              <TableCell className="py-3 text-text-secondary">
                {row.squadSetor ?? "—"}
              </TableCell>

              <TableCell className="py-3">
                {row.isActive ? (
                  <Badge className="bg-green-100 text-green-700 border-transparent rounded-full hover:bg-green-100">
                    Ativo
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-text-secondary rounded-full"
                  >
                    Inativo
                  </Badge>
                )}
              </TableCell>

              <TableCell className="py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/configuracoes/prompts-ia/${row.id}`)}
                  >
                    Editar
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isDefault || isToggling}
                    onClick={() => onToggle(row)}
                  >
                    {isToggling
                      ? "Aguarde..."
                      : row.isActive
                        ? "Desativar"
                        : "Ativar"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isDefault}
                    className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 disabled:opacity-40"
                    onClick={() => onDelete(row)}
                  >
                    Excluir
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
