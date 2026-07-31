"use client";

import { useCallback, useEffect } from "react";
import { useQueryState } from "nuqs";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useUpdateLiberacao } from "@/hooks/liberacoes/use-update-liberacao";
import type { LiberacaoItem } from "@/interfaces/liberacao";
import { LiberacaoEditHeader } from "@/components/liberacoes/edicao/liberacao-edit-header";
import { AbaLiberacao } from "@/components/liberacoes/edicao/abas/aba-liberacao";
import { AbaCasosVersao } from "@/components/liberacoes/edicao/abas/aba-casos-versao";
import {
  LIBERACAO_EDIT_TABS,
  liberacaoEditTabParser,
  type LiberacaoEditTab,
} from "@/components/liberacoes/edicao/liberacao-edit-url-parsers";
import {
  liberacaoEditFormSchema,
  type LiberacaoEditFormData,
} from "@/components/liberacoes/edicao/schema";
import {
  buildUpdateLiberacaoPayload,
  liberacaoToFormValues,
} from "@/components/liberacoes/edicao/utils";

export interface LiberacaoEditFormProps {
  liberacao: LiberacaoItem;
}

const FORM_ID = "liberacao-edit-form";
const TAB_CONTENT_CLASS =
  "mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden";

export function LiberacaoEditForm({ liberacao }: LiberacaoEditFormProps) {
  const [activeTab, setActiveTabQuery] = useQueryState(
    "aba",
    liberacaoEditTabParser.withOptions({ history: "replace", shallow: false }),
  );

  const handleTabChange = useCallback(
    (value: string) => {
      if (!LIBERACAO_EDIT_TABS.includes(value as LiberacaoEditTab)) return;
      void setActiveTabQuery(
        value === "liberacao" ? null : (value as LiberacaoEditTab),
      );
    },
    [setActiveTabQuery],
  );

  const updateLiberacao = useUpdateLiberacao();

  const methods = useForm<LiberacaoEditFormData>({
    resolver: zodResolver(liberacaoEditFormSchema),
    defaultValues: liberacaoToFormValues(liberacao),
  });

  useEffect(() => {
    methods.reset(liberacaoToFormValues(liberacao));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset apenas quando os dados do registro mudam
  }, [liberacao]);

  const isFechada = liberacao.status === "FECHADO";
  const isSaving = methods.formState.isSubmitting || updateLiberacao.isPending;

  async function onSubmit(data: LiberacaoEditFormData) {
    if (isFechada) return;
    try {
      const payload = buildUpdateLiberacaoPayload(data);
      await updateLiberacao.mutateAsync({
        registro: liberacao.registro,
        data: payload,
      });
      toast.success("Liberação atualizada com sucesso.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar liberação.",
      );
    }
  }

  const showSalvar = activeTab === "liberacao";

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:overflow-hidden">
      <FormProvider {...methods}>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex min-h-0 flex-1 flex-col lg:overflow-hidden"
        >
          <LiberacaoEditHeader
            registro={liberacao.registro}
            status={liberacao.status}
            formId={FORM_ID}
            isSaving={isSaving}
            showSalvar={showSalvar}
          />

          <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-auto">
            <div className={cn("flex-1", showSalvar ? "pb-24" : "pb-12")}>
              <TabsContent value="liberacao" className={TAB_CONTENT_CLASS}>
                <form
                  id={FORM_ID}
                  onSubmit={methods.handleSubmit(onSubmit)}
                  className="min-h-0"
                >
                  <AbaLiberacao liberacao={liberacao} disabled={isFechada} />
                </form>
              </TabsContent>

              <TabsContent value="casos-versao" className={TAB_CONTENT_CLASS}>
                <div className="flex min-h-0 flex-1 flex-col min-w-0">
                  <AbaCasosVersao
                    registro={liberacao.registro}
                    versoes={liberacao.versoes}
                    enabled={activeTab === "casos-versao"}
                  />
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </FormProvider>
    </div>
  );
}
