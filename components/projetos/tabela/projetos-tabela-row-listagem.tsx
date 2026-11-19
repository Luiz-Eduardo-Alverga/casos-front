"use client";

import { useRouter } from "next/navigation";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProjetoStatusBadge } from "@/components/projetos/tabela/projeto-status-badge";
import { formatSgpDateTimeToPt } from "@/components/projetos/utils";
import { cn } from "@/lib/utils";
import { Copy, SquarePen } from "lucide-react";
import type { SgpCadastroData } from "@/interfaces/sgp-cadastro";

export interface ProjetosTabelaRowListagemProps {
  item: SgpCadastroData;
  /** Sem callback, o botão Clonar não aparece (permissão decidida no entrypoint). */
  onClonar?: (item: SgpCadastroData) => void;
  /** Registro da origem quando esta linha é um projeto recém-clonado (destaque "Novo"). */
  origemClone?: number | null;
}

export function ProjetosTabelaRowListagem({
  item,
  onClonar,
  origemClone = null,
}: ProjetosTabelaRowListagemProps) {
  const router = useRouter();
  const isNovo = origemClone != null;

  return (
    <TableRow
      key={item.registro}
      className={cn(
        "border-t border-border-strong",
        isNovo
          ? "bg-panel-badge-importance-yellow-bg hover:bg-panel-badge-importance-yellow-bg"
          : "bg-background hover:bg-muted/30",
      )}
    >
      <TableCell className="w-[80px] py-3 px-5 align-middle">
        <span className="text-base font-medium text-text-primary whitespace-nowrap">
          #{item.registro}
        </span>
      </TableCell>
      <TableCell className="min-w-0 flex-1 py-3 px-5 align-middle">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-text-primary">
            {item.nome_projeto}
          </span>
          {isNovo ? (
            <span className="inline-flex items-center rounded-full bg-panel-badge-importance-yellow px-2 py-0 text-xs font-semibold text-primary">
              Novo
            </span>
          ) : null}
        </div>
        {isNovo ? (
          <p className="text-xs text-text-secondary">
            Clonado do projeto #{origemClone}
          </p>
        ) : null}
      </TableCell>
      <TableCell className="w-[148px] py-3 px-5 align-middle text-sm font-light text-text-primary">
        {formatSgpDateTimeToPt(item.data_inicio)}
      </TableCell>
      <TableCell className="w-[148px] py-3 px-5 align-middle text-sm font-light text-text-primary">
        {formatSgpDateTimeToPt(item.data_fim)}
      </TableCell>
      <TableCell className="w-[148px] py-3 px-5 align-middle">
        <ProjetoStatusBadge status={item.status} />
      </TableCell>
      <TableCell
        className={cn(
          "py-3 px-5 align-middle",
          onClonar ? "w-[112px]" : "w-[76px]",
        )}
      >
        <div className="flex items-center justify-end gap-1">
          {onClonar ? (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onClonar(item)}
                    aria-label={`Clonar o projeto ${item.nome_projeto}`}
                  >
                    <Copy className="h-4 w-4 text-text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clonar projeto</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push(`/projetos/${item.registro}`)}
            aria-label="Editar projeto"
          >
            <SquarePen className="h-4 w-4 text-text-primary" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
