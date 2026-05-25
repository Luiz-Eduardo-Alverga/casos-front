"use client";

import { useRouter } from "next/navigation";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProjetoStatusBadge } from "@/components/projetos/tabela/projeto-status-badge";
import { formatSgpDateTimeToPt } from "@/components/projetos/utils";
import { ExternalLink, SquarePen } from "lucide-react";
import toast from "react-hot-toast";
import type { SgpCadastroData } from "@/interfaces/sgp-cadastro";

function handleAcaoEmBreve() {
  toast("Em breve");
}

export interface ProjetosTabelaRowListagemProps {
  item: SgpCadastroData;
}

export function ProjetosTabelaRowListagem({
  item,
}: ProjetosTabelaRowListagemProps) {
  const router = useRouter();

  return (
    <TableRow
      key={item.registro}
      className="bg-background border-t border-border-strong hover:bg-muted/30"
    >
      <TableCell className="w-[80px] py-3 px-5 align-middle">
        <span className="text-base font-medium text-text-primary whitespace-nowrap">
          #{item.registro}
        </span>
      </TableCell>
      <TableCell className="min-w-0 flex-1 py-3 px-5 align-middle">
        <span className="text-sm font-medium text-text-primary">
          {item.nome_projeto}
        </span>
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
      <TableCell className="w-[76px] py-3 px-5 align-middle">
        <div className="flex items-center justify-end gap-1">
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
          {/* <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled
            onClick={handleAcaoEmBreve}
            aria-label="Abrir projeto em nova aba"
          >
            <ExternalLink className="h-4 w-4 text-text-primary" />
          </Button> */}
        </div>
      </TableCell>
    </TableRow>
  );
}
