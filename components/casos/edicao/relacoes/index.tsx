"use client";

import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { CasoEditTabCardHeader } from "../caso-edit-card-header";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { CARD_HEADER_PRESETS } from "@/lib/casos/card-header-theme";
import { RelacoesForm } from "./relacoes-form";
import { RelacoesTable } from "./relacoes-table";
import { isTipoRelacaoCaso } from "./utils";
import type { AbaRelacoesProps, RelacaoFormValues } from "./types";
import { useCasoEdit } from "../caso-edit-context";
import { useCreateCasoRelacao } from "@/hooks/casos/relacoes/use-create-caso-relacao";
import { useUpdateCasoRelacao } from "@/hooks/casos/relacoes/use-update-caso-relacao";
import { useDeleteCasoRelacao } from "@/hooks/casos/relacoes/use-delete-caso-relacao";
import toast from "react-hot-toast";

export function AbaRelacoes({ relacoes }: AbaRelacoesProps) {
  const { numeroCaso, invalidate, canEditCase } = useCasoEdit();
  const createCasoRelacao = useCreateCasoRelacao();
  const updateCasoRelacao = useUpdateCasoRelacao();
  const deleteCasoRelacao = useDeleteCasoRelacao();
  const methods = useForm<RelacaoFormValues>({
    defaultValues: {
      tipo_relacao: "3",
      caso_relacionado: "",
      descricao_resumo: "",
    },
  });

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editTipoRelacao, setEditTipoRelacao] = useState("3");
  const [editCasoRelacionado, setEditCasoRelacionado] = useState("");
  const [editDescricaoResumo, setEditDescricaoResumo] = useState("");
  const [excluirModal, setExcluirModal] = useState<{
    open: boolean;
    sequencia: number;
  }>({
    open: false,
    sequencia: 0,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const casoRelacionadoValue =
    useWatch({ control: methods.control, name: "caso_relacionado" }) ?? "";
  const descricaoResumoValue =
    useWatch({ control: methods.control, name: "descricao_resumo" }) ?? "";

  const isSaving =
    createCasoRelacao.isPending || updateCasoRelacao.isPending;
  const isEditing = editandoId != null;
  const canSubmit =
    Boolean(casoRelacionadoValue.trim()) && Boolean(descricaoResumoValue.trim());

  const limparFormulario = () => {
    methods.setValue("tipo_relacao", "3");
    methods.setValue("caso_relacionado", "");
    methods.setValue("descricao_resumo", "");
  };

  const cancelarEdicaoInline = () => {
    setEditandoId(null);
    setEditTipoRelacao("3");
    setEditCasoRelacionado("");
    setEditDescricaoResumo("");
  };

  const salvarEdicaoInline = async () => {
    if (editandoId == null) return;
    const tipoRelacao = Number(editTipoRelacao);
    const casoRelacionado = Number(editCasoRelacionado);
    const descricaoResumo = editDescricaoResumo.trim();
    if (!Number.isFinite(casoRelacionado) || casoRelacionado <= 0) return;
    if (!isTipoRelacaoCaso(tipoRelacao)) return;
    if (!descricaoResumo) return;

    await updateCasoRelacao.mutateAsync({
      id: editandoId,
      data: {
        tipo_relacao: tipoRelacao,
        caso_relacionado: casoRelacionado,
        descricao_resumo: descricaoResumo,
      },
    });
    toast.success("Relação atualizada com sucesso.");
    invalidate();
    cancelarEdicaoInline();
  };

  return (
    <>
      <FormProvider {...methods}>
        <Card className="bg-card shadow-card rounded-lg flex flex-col h-full lg:min-h-0 lg:flex-1">
          <CasoEditTabCardHeader
            title="Relacionamentos do caso"
            icon={CARD_HEADER_PRESETS.relacoes.icon}
            iconClassName={CARD_HEADER_PRESETS.relacoes.iconClassName}
          />

          <CardContent className="p-6 pt-3 space-y-4 lg:flex-1">
            <RelacoesForm
              methods={methods}
              isSaving={isSaving}
              disabled={isEditing || !canEditCase}
              canSubmit={canSubmit}
              onSubmit={async () => {
                if (isEditing) return;
                const values = methods.getValues();
                const tipoRelacao = Number(values.tipo_relacao);
                const casoRelacionado = Number(values.caso_relacionado);
                const descricaoResumo = values.descricao_resumo.trim();
                if (!Number.isFinite(casoRelacionado) || casoRelacionado <= 0) return;
                if (!isTipoRelacaoCaso(tipoRelacao)) return;
                if (!descricaoResumo) return;
                await createCasoRelacao.mutateAsync({
                  registro: numeroCaso,
                  tipo_relacao: tipoRelacao,
                  caso_relacionado: casoRelacionado,
                  descricao_resumo: descricaoResumo,
                });
                toast.success("Relação criada com sucesso.");
                invalidate();
                limparFormulario();
              }}
            />

            <RelacoesTable
              relacoes={relacoes}
              isSaving={isSaving}
              editandoId={editandoId}
              editTipoRelacao={editTipoRelacao}
              editCasoRelacionado={editCasoRelacionado}
              editDescricaoResumo={editDescricaoResumo}
              onChangeTipoRelacao={setEditTipoRelacao}
              onChangeCasoRelacionado={setEditCasoRelacionado}
              onChangeDescricaoResumo={setEditDescricaoResumo}
              onStartEdit={(item) => {
                const tipoRelacao = Number(item.tipo_relacao);
                setEditandoId(item.sequencia);
                setEditTipoRelacao(
                  isTipoRelacaoCaso(tipoRelacao) ? String(tipoRelacao) : "3"
                );
                setEditCasoRelacionado(String(item.caso_relacionado ?? ""));
                setEditDescricaoResumo(item.descricao_resumo ?? "");
              }}
              onCancelEdit={cancelarEdicaoInline}
              onSaveEdit={salvarEdicaoInline}
              onAskDelete={(sequencia) =>
                setExcluirModal({ open: true, sequencia })
              }
              readOnly={!canEditCase}
            />
          </CardContent>
        </Card>
      </FormProvider>

      <ConfirmacaoModal
        open={excluirModal.open}
        onOpenChange={(open) =>
          !open && setExcluirModal({ open: false, sequencia: 0 })
        }
        titulo="Excluir relação"
        descricao="Tem certeza que deseja excluir esta relação? Esta ação não pode ser desfeita."
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={async () => {
          if (!excluirModal.open) return;
          setIsDeleting(true);
          try {
            await deleteCasoRelacao.mutateAsync(excluirModal.sequencia);
            toast.success("Relação excluída com sucesso.");
            invalidate();
            setExcluirModal({ open: false, sequencia: 0 });
          } finally {
            setIsDeleting(false);
          }
        }}
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}

