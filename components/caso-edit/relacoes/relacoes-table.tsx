"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/painel/empty-state";
import type { CasoRelacoes } from "@/interfaces/projeto-memoria";
import {
  TIPO_RELACAO_CASO_LABEL,
  type TipoRelacaoCaso,
} from "@/services/projeto-casos-relacoes/create";
import { Pencil, Trash2 } from "lucide-react";
import { TIPO_RELACAO_VALUES, isTipoRelacaoCaso } from "./utils";

export interface RelacoesTableProps {
  relacoes: CasoRelacoes[];
  isSaving: boolean;
  editandoId: number | null;
  editTipoRelacao: string;
  editCasoRelacionado: string;
  editDescricaoResumo: string;
  onChangeTipoRelacao: (next: string) => void;
  onChangeCasoRelacionado: (next: string) => void;
  onChangeDescricaoResumo: (next: string) => void;
  onStartEdit: (item: CasoRelacoes) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void | Promise<void>;
  onAskDelete: (sequencia: number) => void;
}

export function RelacoesTable({
  relacoes,
  isSaving,
  editandoId,
  editTipoRelacao,
  editCasoRelacionado,
  editDescricaoResumo,
  onChangeTipoRelacao,
  onChangeCasoRelacionado,
  onChangeDescricaoResumo,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onAskDelete,
}: RelacoesTableProps) {
  const lista = Array.isArray(relacoes) ? relacoes : [];

  if (lista.length === 0) {
    return (
      <EmptyState
        imageAlt="Nenhuma relação"
        imageSrc="/images/empty-state-casos-produto.svg"
        title="Nenhuma relação"
        description="Adicione uma relação acima."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-white border-b border-white hover:bg-white">
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Data
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Relação
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Caso relacionado
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Descrição
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5 w-[100px]">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lista.map((item) => {
          const isEditingRow = editandoId === item.sequencia;
          const canSaveInline = (() => {
            const tipoNum = Number(editTipoRelacao);
            const casoNum = Number(editCasoRelacionado);
            return (
              isEditingRow &&
              isTipoRelacaoCaso(tipoNum) &&
              Number.isFinite(casoNum) &&
              casoNum > 0 &&
              Boolean(editDescricaoResumo.trim())
            );
          })();

          return (
            <TableRow
              key={item.sequencia}
              className="bg-white border-t border-border-divider hover:bg-white"
            >
            <TableCell className="py-3 px-2.5">
              <span className="text-sm text-text-secondary">
                {item.data_relacao ?? "—"}
              </span>
            </TableCell>
            <TableCell className="py-3 px-2.5">
              {isEditingRow ? (
                <Select
                  value={editTipoRelacao}
                  onValueChange={onChangeTipoRelacao}
                  disabled={isSaving}
                >
                  <SelectTrigger className="h-9 rounded-lg border-border-input min-w-[190px]">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_RELACAO_VALUES.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-sm text-text-primary font-semibold">
                  {item.tipo_relacao_nome ??
                    TIPO_RELACAO_CASO_LABEL[
                      item.tipo_relacao as TipoRelacaoCaso
                    ] ??
                    "—"}
                </span>
              )}
            </TableCell>
            <TableCell className="py-3 px-2.5">
              {isEditingRow ? (
                <Input
                  type="number"
                  min={1}
                  value={editCasoRelacionado}
                  onChange={(e) => onChangeCasoRelacionado(e.target.value)}
                  placeholder="Caso numero..."
                  className="h-9 rounded-lg border-border-input px-[17px]"
                  disabled={isSaving}
                />
              ) : (
                <span className="text-sm text-text-primary">
                  #{item.caso_relacionado}
                </span>
              )}
            </TableCell>
            <TableCell className="py-3 px-2.5">
              {isEditingRow ? (
                <Input
                  value={editDescricaoResumo}
                  onChange={(e) => onChangeDescricaoResumo(e.target.value)}
                  placeholder="Descreva a relação..."
                  className="h-9 rounded-lg border-border-input px-[17px]"
                  disabled={isSaving}
                />
              ) : (
                <span className="text-sm text-text-secondary">
                  {item.descricao_resumo ?? "—"}
                </span>
              )}
            </TableCell>
            <TableCell className="py-3 px-2.5">
              {isEditingRow ? (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCancelEdit}
                    className="rounded-lg"
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={onSaveEdit}
                    disabled={!canSaveInline || isSaving}
                    className="rounded-lg"
                  >
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-lg"
                    onClick={() => onStartEdit(item)}
                    disabled={isSaving}
                    aria-label="Editar relação"
                  >
                    <Pencil className="size-4 text-foreground" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-lg text-destructive hover:text-destructive"
                    onClick={() => onAskDelete(item.sequencia)}
                    disabled={isSaving}
                    aria-label="Excluir relação"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )}
            </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

