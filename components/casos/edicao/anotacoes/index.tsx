"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "../caso-edit-card-header";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { CARD_HEADER_PRESETS } from "@/lib/casos/card-header-theme";
import { AnotacoesEditor } from "./anotacoes-editor";
import { AnotacoesList } from "./anotacoes-list";
import type { AbaAnotacoesProps } from "./types";
import { useReportAnalysis } from "@/hooks/casos/anotacoes/use-report-analysis";
import { useCreateAnotacao } from "@/hooks/casos/anotacoes/use-create-anotacao";
import { useUpdateAnotacao } from "@/hooks/casos/anotacoes/use-update-anotacao";
import { useDeleteAnotacao } from "@/hooks/casos/anotacoes/use-delete-anotacao";
import toast from "react-hot-toast";
import { useCasoEdit } from "../caso-edit-context";

/**
 * Aba Anotações do caso.
 * Estrutura: Card com header (título + badge #caso), seção Descrição Completa (nova anotação) e lista de anotações com scroll interno.
 * Segue PADRAO_COMPONENTES e PADRAO_ESPACAMENTOS.
 */
export function AbaAnotacoes({ report, anotacoes }: AbaAnotacoesProps) {
  const {
    numeroCaso,
    invalidate,
    novaAnotacaoDraft,
    setNovaAnotacaoDraft,
    canEditCase,
  } = useCasoEdit();
  const createAnotacao = useCreateAnotacao();
  const updateAnotacao = useUpdateAnotacao();
  const deleteAnotacao = useDeleteAnotacao();
  const improveReport = useReportAnalysis();
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoTexto, setEditandoTexto] = useState("");
  const [excluirModal, setExcluirModal] = useState<{
    open: boolean;
    sequencia: number;
  }>({ open: false, sequencia: 0 });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdicionar = async () => {
    const texto = novaAnotacaoDraft.trim();
    if (!texto) return;
    await createAnotacao.mutateAsync({
      registro: numeroCaso,
      anotacoes: texto.replace(/\r?\n/g, "\r\n"),
    });
    toast.success("Anotação criada com sucesso.");
    invalidate();
    setNovaAnotacaoDraft("");
  };

  const handleMelhorarComIA = async () => {
    const description = novaAnotacaoDraft.trim();
    if (!description) return;

    try {
      const result = await improveReport.mutateAsync({
        report,
        description,
      });

      const improved = result?.data?.analysis ?? "";
      if (improved.trim()) {
        setNovaAnotacaoDraft(improved);
      }
      toast.success("Descrição melhorada com sucesso");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Erro ao melhorar a descrição com IA.",
      );
    }
  };

  const handleIniciarEdicao = (item: (typeof anotacoes)[number]) => {
    setEditandoId(item.sequencia);
    setEditandoTexto(item.anotacoes);
  };

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setEditandoTexto("");
  };

  const handleSalvarEdicao = async () => {
    if (editandoId == null) return;
    await updateAnotacao.mutateAsync({
      id: editandoId,
      data: { anotacoes: editandoTexto },
    });
    toast.success("Anotação atualizada com sucesso.");
    invalidate();
    setEditandoId(null);
    setEditandoTexto("");
  };

  const handleExcluirConfirm = async () => {
    if (!excluirModal.open) return;
    setIsDeleting(true);
    try {
      await deleteAnotacao.mutateAsync(excluirModal.sequencia);
      toast.success("Anotação excluída com sucesso.");
      invalidate();
      setExcluirModal({ open: false, sequencia: 0 });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="bg-card shadow-card rounded-lg flex flex-col h-full lg:min-h-0 lg:flex-1">
        <CasoEditCardHeader
          title="Anotações do caso"
          icon={CARD_HEADER_PRESETS.anotacoes.icon}
          iconClassName={CARD_HEADER_PRESETS.anotacoes.iconClassName}
          badge={numeroCaso}
        />

        <CardContent className="p-6 pt-3 flex flex-col lg:flex-1 ">
          <AnotacoesEditor
            value={novaAnotacaoDraft}
            onChange={setNovaAnotacaoDraft}
            onSave={handleAdicionar}
            disabled={createAnotacao.isPending || !canEditCase}
            onImproveWithIA={handleMelhorarComIA}
            isImproving={improveReport.isPending}
          />

          <AnotacoesList
            anotacoes={anotacoes}
            editandoId={editandoId}
            editandoTexto={editandoTexto}
            onEditandoTextoChange={setEditandoTexto}
            onIniciarEdicao={handleIniciarEdicao}
            onCancelarEdicao={handleCancelarEdicao}
            onSalvarEdicao={handleSalvarEdicao}
            onAskDelete={(sequencia) =>
              setExcluirModal({ open: true, sequencia })
            }
            readOnly={!canEditCase}
          />
        </CardContent>
      </Card>

      <ConfirmacaoModal
        open={excluirModal.open}
        onOpenChange={(open) =>
          !open && setExcluirModal({ open: false, sequencia: 0 })
        }
        titulo="Excluir anotação"
        descricao="Tem certeza que deseja excluir esta anotação? Esta ação não pode ser desfeita."
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirConfirm}
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
