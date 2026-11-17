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
import { Badge } from "@/components/ui/badge";
import type { ProducaoDetalheItem } from "@/interfaces/projeto-memoria";
import { Pencil, Trash2 } from "lucide-react";
import {
  formatDataHoraProducao,
  formatDuracaoMinutos,
  minutosDuracaoProducaoApi,
  parseDataHoraProducaoApi,
} from "./utils";

const getTipoProducaoBadgeClassName = (tipo: string) => {
  switch (tipo) {
    case "TESTANDO":
      return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";
    case "RETORNO":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400";
    case "DESENVOLVENDO":
    default:
      return "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400";
  }
};

export interface ProducaoDetalhesProps {
  producaoList: ProducaoDetalheItem[];
  agoraAtual: Date;
  /** Abre o modal "Editar produção" para o lançamento. */
  onEditar: (row: ProducaoDetalheItem) => void;
  onAskDelete: (sequencia: number) => void;
  readOnly?: boolean;
}

export function ProducaoDetalhes({
  producaoList,
  agoraAtual,
  onEditar,
  onAskDelete,
  readOnly = false,
}: ProducaoDetalhesProps) {
  if (producaoList.length === 0) {
    return (
      <p className="text-sm text-text-secondary py-4">
        Nenhum detalhe de produção registrado.
      </p>
    );
  }

  const producaoListOrdenada = [...producaoList].sort((a, b) => {
    const da =
      parseDataHoraProducaoApi(a.datas?.abertura) ??
      parseDataHoraProducaoApi(a.datas?.fechamento);
    const db =
      parseDataHoraProducaoApi(b.datas?.abertura) ??
      parseDataHoraProducaoApi(b.datas?.fechamento);

    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;

    return db.getTime() - da.getTime();
  });

  return (
    <Table className="min-w-max">
      <TableHeader>
        <TableRow className="bg-table-row-bg border-b border-border hover:bg-table-row-hover">
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Abertura
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Fechamento
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5 whitespace-nowrap">
            Duração
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Tipo
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Projeto
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Usuário
          </TableHead>
          {!readOnly ? (
            <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5 w-[120px]">
              Ações
            </TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {producaoListOrdenada.map((row) => {
          const emAndamento = row.datas?.fechamento === null;
          const aberturaFmt = formatDataHoraProducao(row.datas?.abertura);
          return (
            <TableRow
              key={row.sequencia}
              className="bg-table-row-bg border-t border-border-divider hover:bg-table-row-hover"
            >
              <TableCell className="py-3 px-2.5 text-sm text-text-primary">
                {aberturaFmt}
              </TableCell>
              <TableCell className="py-3 px-2.5 text-sm text-text-primary">
                {formatDataHoraProducao(row.datas?.fechamento)}
              </TableCell>
              <TableCell className="py-3 px-2.5 text-sm text-text-primary whitespace-nowrap">
                {formatDuracaoMinutos(
                  minutosDuracaoProducaoApi(
                    row.datas?.abertura,
                    row.datas?.fechamento,
                    agoraAtual,
                  ),
                )}
              </TableCell>
              <TableCell className="py-3 px-2.5">
                {row.tipo ? (
                  <Badge
                    variant="secondary"
                    className={`rounded-full ${getTipoProducaoBadgeClassName(row.tipo)} border-transparent hover:${getTipoProducaoBadgeClassName(row.tipo)}`}
                  >
                    {row.tipo}
                  </Badge>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="py-3 px-2.5 text-sm text-text-primary">
                {row.projeto_id != null ? String(row.projeto_id) : "—"}
              </TableCell>
              <TableCell className="py-3 px-2.5 text-sm text-text-primary">
                {row.usuario_nome ?? "—"}
              </TableCell>
              {!readOnly ? (
                <TableCell className="py-3 px-2.5">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-lg"
                      onClick={() => onEditar(row)}
                      aria-label={`Editar produção de ${row.tipo || "lançamento"} aberta em ${aberturaFmt}`}
                      title="Editar produção"
                      // Lançamento em andamento não é editado (como antes).
                      disabled={emAndamento}
                    >
                      <Pencil className="size-4 text-foreground" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-lg text-destructive hover:text-destructive"
                      onClick={() => onAskDelete(row.sequencia)}
                      aria-label="Excluir produção"
                      disabled={emAndamento}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
