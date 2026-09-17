"use client";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { colaboradorLabelById } from "@/components/produtos/cadastro/utils";
import { ChecklistResponsavelField } from "@/components/produtos/edicao/checklist/checklist-responsavel-field";
import {
  checklistItemSchema,
  getChecklistItemDefaultValues,
  type ChecklistItemFormData,
} from "@/components/produtos/edicao/checklist/checklist-schema";
import { checklistResponsavelOptions } from "@/components/produtos/edicao/checklist/checklist-utils";
import type { ComboboxOption } from "@/components/ui/combobox";
import type { User } from "@/lib/auth";
import type { Usuario } from "@/services/auxiliar/usuarios";
import type { ProdutoChecklistData } from "@/services/produtos/types";

export interface ChecklistItemEditProps {
  item: ProdutoChecklistData;
  posicao: number;
  usuarios?: Usuario[];
  currentUser?: User | null;
  isSaving?: boolean;
  onSave: (data: ChecklistItemFormData) => Promise<void> | void;
  onCancel: () => void;
}

export function ChecklistItemEdit({
  item,
  posicao,
  usuarios,
  currentUser,
  isSaving = false,
  onSave,
  onCancel,
}: ChecklistItemEditProps) {
  const methods = useForm<ChecklistItemFormData>({
    resolver: zodResolver(checklistItemSchema),
    defaultValues: getChecklistItemDefaultValues({
      descricao: item.DescricaoItem,
      responsavelId:
        item.id_responsavel != null && item.id_responsavel > 0
          ? String(item.id_responsavel)
          : "",
    }),
  });

  useEffect(() => {
    methods.reset(
      getChecklistItemDefaultValues({
        descricao: item.DescricaoItem,
        responsavelId:
          item.id_responsavel != null && item.id_responsavel > 0
            ? String(item.id_responsavel)
            : "",
      }),
    );
  }, [item, methods.reset]);

  const selectedLabel = colaboradorLabelById(
    item.id_responsavel,
    usuarios,
    currentUser,
  );
  const options: ComboboxOption[] = checklistResponsavelOptions(
    usuarios,
    currentUser,
    item.id_responsavel != null && item.id_responsavel > 0
      ? {
          id: String(item.id_responsavel),
          label: selectedLabel || `#${item.id_responsavel}`,
        }
      : undefined,
  );

  async function handleSubmit(data: ChecklistItemFormData) {
    await onSave(data);
  }

  return (
    <FormProvider {...methods}>
      <form
        className="flex items-center gap-2 border-b border-border-divider px-4 py-4"
        onSubmit={methods.handleSubmit(handleSubmit, () => {
          toast.error(PRODUTO_LABELS.descrevaItemChecklist);
        })}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
        }}
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
          {posicao}
        </span>
        <div className="min-w-[180px] flex-1">
          <Input
            autoFocus
            clearable={false}
            placeholder={PRODUTO_LABELS.novoItemPlaceholder}
            className="h-9 rounded-lg border-border-input"
            disabled={isSaving}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void methods.handleSubmit(handleSubmit, () => {
                  toast.error(PRODUTO_LABELS.descrevaItemChecklist);
                })();
              }
            }}
            {...methods.register("descricao")}
          />
        </div>
        <ChecklistResponsavelField options={options} disabled={isSaving} />
        <Button type="submit" size="sm" className="h-9 shrink-0" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            PRODUTO_LABELS.salvar
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 shrink-0"
          disabled={isSaving}
          onClick={onCancel}
        >
          {PRODUTO_LABELS.cancelar}
        </Button>
      </form>
    </FormProvider>
  );
}
