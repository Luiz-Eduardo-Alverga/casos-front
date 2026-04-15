"use client";

import type { ProdutoOrdem } from "@/services/projeto-dev/get-produtos-ordem";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Pencil, Tag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SortableRowProps {
  item: ProdutoOrdem;
  index: number;
  sortableId: string;
  isEditing: boolean;
  editVersao: string;
  versoesEdicao: string[];
  isSavingEdicao: boolean;
  isDeleting: boolean;
  onStartEdit: (item: ProdutoOrdem) => void;
  onCancelEdit: () => void;
  onChangeEditVersao: (value: string) => void;
  onConfirmEdit: (item: ProdutoOrdem) => void;
  onDelete: (item: ProdutoOrdem) => void;
}

export function SortableRow({
  item,
  index,
  sortableId,
  isEditing,
  editVersao,
  versoesEdicao,
  isSavingEdicao,
  isDeleting,
  onStartEdit,
  onCancelEdit,
  onChangeEditVersao,
  onConfirmEdit,
  onDelete,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex items-center justify-between rounded-lg border border-border-divider bg-white p-4",
        isDragging && "opacity-60",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="text-text-secondary hover:text-text-primary"
          aria-label={`Mover ${item.produto_nome ?? "produto"} na ordenação`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded bg-blue-100 px-2 text-xs font-bold text-blue-700">
          {index + 1}
        </span>
        <span className="truncate text-sm font-medium text-text-primary">
          {item.produto_nome ?? `Produto ${item.id_produto}`}
        </span>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-3">
          <Select
            value={editVersao}
            onValueChange={onChangeEditVersao}
            disabled={isSavingEdicao}
          >
            <SelectTrigger className="h-10 w-[150px] rounded-lg border-border-divider bg-white">
              <SelectValue placeholder="Selecione a versão..." />
            </SelectTrigger>
            <SelectContent>
              {versoesEdicao.map((versao) => (
                <SelectItem key={versao} value={versao}>
                  {versao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-emerald-500 hover:text-emerald-700"
            onClick={() => onConfirmEdit(item)}
            disabled={isSavingEdicao || !editVersao.trim()}
          >
            <Check className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-text-secondary hover:text-text-primary"
            onClick={onCancelEdit}
            disabled={isSavingEdicao}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700">
            <Tag className="h-3.5 w-3.5" />
            {item.versao}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-text-secondary hover:text-text-primary"
            onClick={() => onStartEdit(item)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-red-500 hover:text-red-600"
            onClick={() => onDelete(item)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
