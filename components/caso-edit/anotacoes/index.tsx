"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "../caso-edit-card-header";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { FileText } from "lucide-react";
import { AnotacoesEditor } from "./anotacoes-editor";
import { AnotacoesList } from "./anotacoes-list";
import type { AbaAnotacoesProps } from "./types";
import { useReportAnalysis } from "@/hooks/use-report-analysis";
import toast from "react-hot-toast";

/**
 * Aba Anotações do caso.
 * Estrutura: Card com header (título + badge #caso), seção Descrição Completa (nova anotação) e lista de anotações com scroll interno.
 * Segue PADRAO_COMPONENTES e PADRAO_ESPACAMENTOS.
 */
export function AbaAnotacoes({
  casoId,
  report,
  anotacoes,
  onCreate,
  onUpdate,
  onDelete,
  isCreating = false,
}: AbaAnotacoesProps) {
  const [novaAnotacao, setNovaAnotacao] = useState("");
  const improveReport = useReportAnalysis();
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoTexto, setEditandoTexto] = useState("");
  const [excluirModal, setExcluirModal] = useState<{
    open: boolean;
    sequencia: number;
  }>({ open: false, sequencia: 0 });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdicionar = async () => {
    const texto = novaAnotacao.trim();
    if (!texto) return;
    await onCreate({ registro: casoId, anotacoes: texto });
    setNovaAnotacao("");
  };

  const handleMelhorarComIA = async () => {
    const description = novaAnotacao.trim();
    if (!description) return;

    try {
      const result = await improveReport.mutateAsync({
        report,
        description,
      });

      const improved = result?.data?.analysis ?? "";
      if (improved.trim()) {
        setNovaAnotacao(improved);
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
    await onUpdate({ id: editandoId, data: { anotacoes: editandoTexto } });
    setEditandoId(null);
    setEditandoTexto("");
  };

  const handleExcluirConfirm = async () => {
    if (!excluirModal.open) return;
    setIsDeleting(true);
    try {
      await onDelete(excluirModal.sequencia);
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
          icon={FileText}
          badge={casoId}
        />

        <CardContent className="p-6 pt-3 flex flex-col lg:flex-1 ">
          <AnotacoesEditor
            value={novaAnotacao}
            onChange={setNovaAnotacao}
            onSave={handleAdicionar}
            disabled={isCreating}
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
