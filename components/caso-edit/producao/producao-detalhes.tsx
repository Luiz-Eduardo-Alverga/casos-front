"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/ui/date-picker";
import type { ProducaoDetalheItem } from "@/interfaces/projeto-memoria";
import { Pencil, Trash2 } from "lucide-react";
import {
  formatDataHoraProducao,
  formatDuracaoMinutos,
  minutosDuracaoEdicao,
  minutosDuracaoProducaoApi,
} from "./utils";

export interface ProducaoDetalhesProps {
  producaoList: ProducaoDetalheItem[];
  agoraAtual: Date;

  editandoSequencia: number | null;
  editandoTipo: string;
  editandoAbertura: Date | undefined;
  editandoFechamento: Date | undefined;
  onEditandoTipoChange: (v: string) => void;
  onEditandoAberturaChange: (v: Date | undefined) => void;
  onEditandoFechamentoChange: (v: Date | undefined) => void;

  isSalvandoEdicao: boolean;
  onIniciarEdicao: (row: ProducaoDetalheItem) => void;
  onCancelarEdicao: () => void;
  onSalvarEdicao: () => void | Promise<void>;
  onAskDelete: (sequencia: number) => void;
}

export function ProducaoDetalhes({
  producaoList,
  agoraAtual,
  editandoSequencia,
  editandoTipo,
  editandoAbertura,
  editandoFechamento,
  onEditandoTipoChange,
  onEditandoAberturaChange,
  onEditandoFechamentoChange,
  isSalvandoEdicao,
  onIniciarEdicao,
  onCancelarEdicao,
  onSalvarEdicao,
  onAskDelete,
}: ProducaoDetalhesProps) {
  if (producaoList.length === 0) {
    return (
      <p className="text-sm text-text-secondary py-4">
        Nenhum detalhe de produção registrado.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-white border-b border-white hover:bg-white">
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
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5 w-[120px]">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {producaoList.map((row) => (
          <TableRow
            key={row.sequencia}
            className="bg-white border-t border-border-divider hover:bg-white"
          >
            <TableCell className="py-3 px-2.5 text-sm text-text-primary">
              {editandoSequencia === row.sequencia ? (
                <DateTimePicker
                  value={editandoAbertura}
                  onChange={onEditandoAberturaChange}
                  placeholder="Abertura"
                  disabled={isSalvandoEdicao}
                  className="min-w-[180px]"
                />
              ) : (
                formatDataHoraProducao(row.datas?.abertura)
              )}
            </TableCell>
            <TableCell className="py-3 px-2.5 text-sm text-text-primary">
              {editandoSequencia === row.sequencia ? (
                <DateTimePicker
                  value={editandoFechamento}
                  onChange={onEditandoFechamentoChange}
                  placeholder="Fechamento"
                  disabled={isSalvandoEdicao}
                  className="min-w-[180px]"
                />
              ) : (
                formatDataHoraProducao(row.datas?.fechamento)
              )}
            </TableCell>
            <TableCell className="py-3 px-2.5 text-sm text-text-primary whitespace-nowrap">
              {editandoSequencia === row.sequencia
                ? formatDuracaoMinutos(
                    minutosDuracaoEdicao(
                      editandoAbertura,
                      editandoFechamento,
                      agoraAtual,
                    ),
                  )
                : formatDuracaoMinutos(
                    minutosDuracaoProducaoApi(
                      row.datas?.abertura,
                      row.datas?.fechamento,
                      agoraAtual,
                    ),
                  )}
            </TableCell>
            <TableCell className="py-3 px-2.5">
              {editandoSequencia === row.sequencia ? (
                <Input
                  type="text"
                  value={editandoTipo}
                  onChange={(e) => onEditandoTipoChange(e.target.value)}
                  placeholder="Tipo"
                  className="h-9 text-sm"
                  disabled={isSalvandoEdicao}
                />
              ) : row.tipo ? (
                <Badge
                  variant="secondary"
                  className="rounded-full bg-sky-100 text-sky-700 border-transparent"
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
            <TableCell className="py-3 px-2.5">
              {editandoSequencia === row.sequencia ? (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCancelarEdicao}
                    className="rounded-lg"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={onSalvarEdicao}
                    disabled={isSalvandoEdicao}
                    className="rounded-lg"
                  >
                    {isSalvandoEdicao ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-lg"
                    onClick={() => onIniciarEdicao(row)}
                    aria-label="Editar produção"
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
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

