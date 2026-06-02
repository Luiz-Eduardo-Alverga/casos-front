"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useFinalizarCaso } from "@/hooks/casos/use-finalizar-caso";
import { useCasoAbertoAtivo } from "@/hooks/producao/use-caso-aberto-ativo";
import { usePararProducao } from "@/hooks/producao/use-parar-producao";
import {
  invalidateCasoAbertoAtivo,
  invalidateProjetoMemoriaForRegistro,
} from "@/hooks/producao/caso-aberto-ativo-cache";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { CasoAbertoMiniPlayerCollapsed } from "@/components/caso-aberto-player/caso-aberto-mini-player-collapsed";
import { CasoAbertoMiniPlayerExpanded } from "@/components/caso-aberto-player/caso-aberto-mini-player-expanded";
import { buildCasoAbertoPlayerViewModel } from "@/components/caso-aberto-player/utils";

export function CasoAbertoMiniPlayer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [finalizarModalOpen, setFinalizarModalOpen] = useState(false);
  const { data } = useCasoAbertoAtivo();
  const pararProducao = usePararProducao();

  const casoId = data?.caso?.caso?.id ?? data?.producao?.registro ?? null;
  const finalizarCaso = useFinalizarCaso(casoId);

  const viewModel = useMemo(
    () => (data ? buildCasoAbertoPlayerViewModel(data) : null),
    [data],
  );

  useEffect(() => {
    if (!data?.hasCasoAberto) {
      setExpanded(false);
    }
  }, [data?.hasCasoAberto]);

  if (!data?.hasCasoAberto || !viewModel || !data.producao) {
    return null;
  }

  const registro = data.producao.registro;

  const handleParar = () => {
    pararProducao.mutate(registro, {
      onSuccess: () => {
        toast.success("Produção parada.");
        setExpanded(false);
      },
      onError: (e) => {
        toast.error(e instanceof Error ? e.message : "Erro ao parar produção.");
      },
    });
  };

  const handleVerCaso = () => {
    setExpanded(false);
    router.push(`/casos/${viewModel.casoId}`);
  };

  const handleAbrirModalFinalizar = () => {
    setFinalizarModalOpen(true);
  };

  const handleConfirmarFinalizar = async () => {
    try {
      const res = await finalizarCaso.mutateAsync(viewModel.casoId);
      toast.success(res.message ?? "Caso finalizado com sucesso.");
      setExpanded(false);
      invalidateCasoAbertoAtivo(queryClient);
      invalidateProjetoMemoriaForRegistro(queryClient, viewModel.casoId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao finalizar caso.");
      throw e;
    }
  };

  return (
    <>
      <div
        className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 lg:left-auto lg:right-6 lg:translate-x-0"
        role="region"
        aria-label="Caso em produção aberto"
      >
        <AnimatePresence mode="wait">
          {expanded ? (
            <CasoAbertoMiniPlayerExpanded
              viewModel={viewModel}
              onCollapse={() => setExpanded(false)}
              onVerCaso={handleVerCaso}
              onFinalizarCaso={handleAbrirModalFinalizar}
              onParar={handleParar}
              isParando={pararProducao.isPending}
              isFinalizando={finalizarCaso.isPending}
            />
          ) : (
            <CasoAbertoMiniPlayerCollapsed
              viewModel={viewModel}
              onExpand={() => setExpanded(true)}
            />
          )}
        </AnimatePresence>
      </div>

      <ConfirmacaoModal
        open={finalizarModalOpen}
        onOpenChange={setFinalizarModalOpen}
        titulo={`Deseja finalizar o caso #${viewModel.casoId}?`}
        descricao={`Esta ação irá encerrar a produção do caso e alterar o status para Corrigido.`}
        confirmarLabel="Finalizar caso"
        cancelarLabel="Cancelar"
        onConfirm={handleConfirmarFinalizar}
        isLoading={finalizarCaso.isPending}
      />
    </>
  );
}
