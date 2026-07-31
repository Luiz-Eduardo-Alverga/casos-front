"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Layers, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { LiberacaoCardHeader } from "@/components/liberacoes/liberacao-card-header";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { useAddLiberacaoVersoes } from "@/hooks/liberacoes/use-add-liberacao-versoes";
import { useDeleteLiberacaoVersao } from "@/hooks/liberacoes/use-delete-liberacao-versao";
import { useVersoes } from "@/hooks/catalogos/use-versoes";
import { resolveVersaoProdutoForApi } from "@/components/casos/shared/versao-combobox";
import type { LiberacaoVersao } from "@/interfaces/liberacao";

interface VersoesCardProps {
  registro: number;
  produtoId: number | string;
  versoes: LiberacaoVersao[];
  disabled?: boolean;
}

type VersaoFormValues = {
  produto: string;
  versao: string;
};

export function VersoesCard({
  registro,
  produtoId,
  versoes,
  disabled,
}: VersoesCardProps) {
  const produto = String(produtoId);
  const [versaoParaRemover, setVersaoParaRemover] =
    useState<LiberacaoVersao | null>(null);

  const methods = useForm<VersaoFormValues>({
    defaultValues: { produto, versao: "" },
  });

  useEffect(() => {
    methods.setValue("produto", produto);
    methods.setValue("versao", "");
  }, [produto, methods]);

  const versaoWatch = methods.watch("versao");

  const { data: versoesCatalog } = useVersoes({
    produto_id: produto,
    enabled: Boolean(produto) && !disabled,
  });

  const addVersoes = useAddLiberacaoVersoes();
  const deleteVersao = useDeleteLiberacaoVersao();

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions: [],
      produto,
      isDisabled: Boolean(disabled) || addVersoes.isPending,
    }),
    [methods, produto, disabled, addVersoes.isPending],
  );

  const handleAdd = async () => {
    const sequencia = methods.getValues("versao");
    const versao = resolveVersaoProdutoForApi(sequencia, versoesCatalog);
    if (!versao) return;

    try {
      await addVersoes.mutateAsync({ registro, data: { versoes: [versao] } });
      toast.success("Versão adicionada com sucesso.");
      methods.setValue("versao", "");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao adicionar versão.",
      );
    }
  };

  const handleRemove = async () => {
    if (!versaoParaRemover) return;
    try {
      await deleteVersao.mutateAsync({
        registro,
        sequencia: versaoParaRemover.sequencia,
      });
      toast.success("Versão removida com sucesso.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao remover versão.",
      );
    }
  };

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <LiberacaoCardHeader icon={Layers} title="Versões vinculadas" />
      <CardContent className="space-y-3 p-6 pt-2">
        {!disabled && (
          <FormProvider {...methods}>
            <CasoFormProvider value={providerValue}>
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  <CasoFormVersao required={false} />
                </div>
                <Button
                  type="button"
                  onClick={() => void handleAdd()}
                  disabled={!versaoWatch?.trim() || addVersoes.isPending}
                  className="h-9 shrink-0 px-3"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar
                </Button>
              </div>
            </CasoFormProvider>
          </FormProvider>
        )}

        {versoes.length === 0 ? (
          <p className="text-sm text-text-secondary">
            Nenhuma versão adicionada.
          </p>
        ) : (
          <div className="space-y-2">
            {versoes.map((v) => (
              <div
                key={v.sequencia}
                className="flex items-center justify-between rounded-lg border border-border-divider px-3 py-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-text-secondary">
                    #{v.sequencia}
                  </span>
                  <span className="font-mono text-sm font-semibold text-text-primary">
                    {v.versao}
                  </span>
                </div>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-text-secondary hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setVersaoParaRemover(v)}
                    aria-label={`Remover versão ${v.versao}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmacaoModal
        open={versaoParaRemover != null}
        onOpenChange={(open) => !open && setVersaoParaRemover(null)}
        titulo="Remover versão"
        descricao={`Tem certeza que deseja remover a versão "${versaoParaRemover?.versao}" deste registro de liberação?`}
        confirmarLabel="Remover"
        cancelarLabel="Cancelar"
        onConfirm={handleRemove}
        variant="danger"
        isLoading={deleteVersao.isPending}
      />
    </Card>
  );
}
