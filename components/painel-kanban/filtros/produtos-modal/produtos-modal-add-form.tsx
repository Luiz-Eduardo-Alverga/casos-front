"use client";

import { FormProvider, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  CasoFormProduto,
  CasoFormProvider,
  CasoFormVersao,
} from "@/components/caso-form";
import { importanceOptions } from "@/mocks/teste";

export interface ProdutosModalAddFormValues {
  produto: string;
  versao: string;
}

interface ProdutosModalAddFormProps {
  form: UseFormReturn<ProdutosModalAddFormValues>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ProdutosModalAddForm({
  form,
  onSubmit,
  isSubmitting,
}: ProdutosModalAddFormProps) {
  const produtoSelecionado = form.watch("produto");

  const providerValue = {
    form,
    importanceOptions,
    produto: produtoSelecionado,
    isDisabled: false,
    lazyLoadComboboxOptions: false,
  };

  return (
    <CasoFormProvider value={providerValue}>
      <FormProvider {...form}>
        <form
          onSubmit={onSubmit}
          className="rounded-lg border border-border-divider bg-[#f8f9fa] p-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <CasoFormProduto required={false} />
            <CasoFormVersao required={false} todas={false} />
            <Button
              type="submit"
              className="h-[42px] min-w-[154px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adicionando..." : "+ Adicionar"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </CasoFormProvider>
  );
}

