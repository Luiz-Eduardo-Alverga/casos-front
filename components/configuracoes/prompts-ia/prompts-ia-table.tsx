"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  canEdit?: boolean;
  onToggle: (row: PromptRow) => void;
}

export function PromptsIaTable({
  rows,
  togglingId,
  canEdit = false,
  onToggle,
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
          <TableHead className="w-[30%]">Setor</TableHead>
          <TableHead className="w-[15%]">Status</TableHead>
          <TableHead className="w-[20%] text-right">Ações</TableHead>
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
                <div className="flex items-center gap-2">
                  <Switch
                    checked={row.isActive}
                    onCheckedChange={() => onToggle(row)}
                    disabled={!canEdit || isDefault || isToggling}
                    aria-label={
                      row.isActive
                        ? `Desativar prompt ${row.name}`
                        : `Ativar prompt ${row.name}`
                    }
                  />
                  <span className="text-xs text-text-secondary">
                    {isToggling
                      ? "Aguarde..."
                      : row.isActive
                        ? "Ativo"
                        : "Inativo"}
                  </span>
                </div>
              </TableCell>

              <TableCell className="py-3 text-right">
                {canEdit ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/configuracoes/prompts-ia/${row.id}`)
                    }
                  >
                    Editar
                  </Button>
                ) : (
                  <span className="text-xs text-text-secondary">—</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
