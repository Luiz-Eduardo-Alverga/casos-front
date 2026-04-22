"use client";

import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "../caso-edit-card-header";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { GitBranch } from "lucide-react";
import { RelacoesForm } from "./relacoes-form";
import { RelacoesTable } from "./relacoes-table";
import { isTipoRelacaoCaso } from "./utils";
import type { AbaRelacoesProps, RelacaoFormValues } from "./types";

export function AbaRelacoes({
  casoId,
  relacoes,
  onAdd,
  onUpdate,
  onDelete,
  isAdding = false,
  isUpdating = false,
}: AbaRelacoesProps) {
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

  const isSaving = isAdding || isUpdating;
  const isEditing = editandoId != null;
  const canSubmit =
    Boolean(casoRelacionadoValue.trim()) && Boolean(descricaoResumoValue.trim());

  const limparFormulario = () => {
    methods.setValue("tipo_relacao", "3");
    methods.setValue("caso_relacionado", "");
    methods.setValue("descricao_resumo", "");
  };

  const handleSalvarRelacao = async () => {
    const values = methods.getValues();
    const tipoRelacao = Number(values.tipo_relacao);
    const casoRelacionado = Number(values.caso_relacionado);
    const descricaoResumo = values.descricao_resumo.trim();

    if (!Number.isFinite(casoRelacionado) || casoRelacionado <= 0) return;
    if (!isTipoRelacaoCaso(tipoRelacao)) return;
    if (!descricaoResumo) return;

    limparFormulario();
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

    await onUpdate({
      id: editandoId,
      data: {
        tipo_relacao: tipoRelacao,
        caso_relacionado: casoRelacionado,
        descricao_resumo: descricaoResumo,
      },
    });
    cancelarEdicaoInline();
  };

  return (
    <>
      <FormProvider {...methods}>
        <Card className="bg-card shadow-card rounded-lg flex flex-col h-full lg:min-h-0 lg:flex-1">
          <CasoEditCardHeader
            title="Relacionamentos do caso"
            icon={GitBranch}
            badge={casoId}
          />

          <CardContent className="p-6 pt-3 space-y-4 lg:flex-1">
            <RelacoesForm
              methods={methods}
              isSaving={isSaving}
              disabled={isEditing}
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
                await onAdd({
                  registro: casoId,
                  tipo_relacao: tipoRelacao,
                  caso_relacionado: casoRelacionado,
                  descricao_resumo: descricaoResumo,
                });
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
            await onDelete(excluirModal.sequencia);
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

