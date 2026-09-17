"use client";

import { FormProvider, useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { ChecklistResponsavelField } from "@/components/produtos/edicao/checklist/checklist-responsavel-field";
import {
  getChecklistItemDefaultValues,
  type ChecklistItemFormData,
} from "@/components/produtos/edicao/checklist/checklist-schema";
import { checklistResponsavelOptions } from "@/components/produtos/edicao/checklist/checklist-utils";
import type { ComboboxOption } from "@/components/ui/combobox";
import type { User } from "@/lib/auth";
import type { Usuario } from "@/services/auxiliar/usuarios";

export interface ChecklistAddRowProps {
  usuarios?: Usuario[];
  currentUser?: User | null;
  isSaving?: boolean;
  onAdd: (data: ChecklistItemFormData) => Promise<void> | void;
}

export function ChecklistAddRow({
  usuarios,
  currentUser,
  isSaving = false,
  onAdd,
}: ChecklistAddRowProps) {
  const methods = useForm<ChecklistItemFormData>({
    defaultValues: getChecklistItemDefaultValues(),
  });

  const options: ComboboxOption[] = checklistResponsavelOptions(
    usuarios,
    currentUser,
  );

  async function handleSubmit(data: ChecklistItemFormData) {
    const descricao = data.descricao.trim();
    if (!descricao) {
      toast.error(PRODUTO_LABELS.descrevaItemAntesAdicionar);
      return;
    }
    const responsavelId = data.responsavelId ?? "";
    await onAdd({ descricao, responsavelId });
    methods.reset(getChecklistItemDefaultValues({ responsavelId }));
  }

  return (
    <FormProvider {...methods}>
      <form
        className="flex items-center gap-2 bg-muted px-4 py-4"
        onSubmit={methods.handleSubmit(handleSubmit)}
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground text-muted-foreground">
          <Plus className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-[180px] flex-1">
          <Input
            clearable={false}
            placeholder={PRODUTO_LABELS.novoItemPlaceholder}
            className="h-9 rounded-lg border-border-input bg-card"
            disabled={isSaving}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void methods.handleSubmit(handleSubmit)();
              }
            }}
            {...methods.register("descricao")}
          />
        </div>
        <ChecklistResponsavelField options={options} disabled={isSaving} />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="h-9 shrink-0"
          disabled={isSaving}
        >
          {PRODUTO_LABELS.adicionar}
        </Button>
      </form>
    </FormProvider>
  );
}
