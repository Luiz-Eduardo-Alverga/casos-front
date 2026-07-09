"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { CasoAbertoMiniPlayerShell } from "@/components/caso-aberto-player/caso-aberto-mini-player-shell";
import {
  isDocumentPictureInPictureSupported,
  openCasoAbertoPipWindow,
  renderCasoAbertoPip,
  unmountCasoAbertoPip,
  type DocumentPictureInPictureWindow,
} from "@/components/caso-aberto-player/caso-aberto-pip";
import {
  buildCasoAbertoPlayerViewModel,
  copyTextToClipboard,
  formatCasoCommitCopy,
  formatCasoTextoCompletoCopy,
} from "@/components/caso-aberto-player/utils";

export function CasoAbertoMiniPlayer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [finalizarModalOpen, setFinalizarModalOpen] = useState(false);
  const [pipWindow, setPipWindow] =
    useState<DocumentPictureInPictureWindow | null>(null);
  const [isPipSupported, setIsPipSupported] = useState(false);
  const pipWindowRef = useRef<DocumentPictureInPictureWindow | null>(null);
  const { data } = useCasoAbertoAtivo();
  const pararProducao = usePararProducao();

  const casoId = data?.caso?.caso?.id ?? data?.producao?.registro ?? null;
  const finalizarCaso = useFinalizarCaso(casoId);

  const viewModel = useMemo(
    () => (data ? buildCasoAbertoPlayerViewModel(data) : null),
    [data],
  );

  useEffect(() => {
    setIsPipSupported(isDocumentPictureInPictureSupported());
  }, []);

  const closePipWindow = useCallback(() => {
    unmountCasoAbertoPip();
    pipWindowRef.current = null;
    setPipWindow(null);
  }, []);

  useEffect(() => {
    if (!data?.hasCasoAberto) {
      setExpanded(false);
      closePipWindow();
    }
  }, [closePipWindow, data?.hasCasoAberto]);

  const handleParar = useCallback(() => {
    if (!data?.producao) return;
    const registro = data.producao.registro;

    pararProducao.mutate(registro, {
      onSuccess: () => {
        toast.success("Produção parada.");
        setExpanded(false);
        closePipWindow();
      },
      onError: (e) => {
        toast.error(e instanceof Error ? e.message : "Erro ao parar produção.");
      },
    });
  }, [closePipWindow, data?.producao, pararProducao]);

  const focusMainWindow = useCallback(() => {
    try {
      window.focus();
    } catch {
      // Alguns browsers podem bloquear focus programático.
    }
  }, []);

  const handleVerCaso = useCallback(() => {
    if (!viewModel) return;
    setExpanded(false);
    focusMainWindow();
    router.push(`/casos/${viewModel.casoId}`);
    // toast("Conclua a ação na janela principal do navegador.");
  }, [focusMainWindow, router, viewModel]);

  const handleAbrirModalFinalizar = useCallback(() => {
    focusMainWindow();
    setFinalizarModalOpen(true);
  }, [focusMainWindow]);

  const handleCopiarCommit = useCallback(
    async (targetWindow: Window = window) => {
      if (!viewModel) return;
      try {
        await copyTextToClipboard(
          formatCasoCommitCopy(viewModel),
          targetWindow,
        );
        toast.success("Formato commit copiado.");
      } catch {
        toast.error("Não foi possível copiar o formato commit.");
      }
    },
    [viewModel],
  );

  const handleCopiarTextoCompleto = useCallback(
    async (targetWindow: Window = window) => {
      if (!viewModel) return;
      try {
        await copyTextToClipboard(
          formatCasoTextoCompletoCopy(viewModel),
          targetWindow,
        );
        toast.success("Texto completo copiado.");
      } catch {
        toast.error("Não foi possível copiar o texto.");
      }
    },
    [viewModel],
  );

  useEffect(() => {
    if (!pipWindow || !viewModel) return;

    if (pipWindow.closed) {
      pipWindowRef.current = null;
      setPipWindow(null);
      return;
    }

    renderCasoAbertoPip(pipWindow, {
      viewModel,
      initialLayout: "expanded",
      onParar: handleParar,
      onVerCaso: handleVerCaso,
      onFinalizarCaso: handleAbrirModalFinalizar,
      onCopiarCommit: () => void handleCopiarCommit(pipWindow),
      onCopiarTextoCompleto: () => void handleCopiarTextoCompleto(pipWindow),
      isParando: pararProducao.isPending,
      isFinalizando: finalizarCaso.isPending,
    });
  }, [
    finalizarCaso.isPending,
    handleAbrirModalFinalizar,
    handleCopiarCommit,
    handleCopiarTextoCompleto,
    handleParar,
    handleVerCaso,
    pararProducao.isPending,
    pipWindow,
    viewModel,
  ]);

  useEffect(() => {
    return () => {
      unmountCasoAbertoPip();
      pipWindowRef.current = null;
    };
  }, []);

  if (!data?.hasCasoAberto || !viewModel || !data.producao) {
    return null;
  }

  const handleConfirmarFinalizar = async () => {
    try {
      const res = await finalizarCaso.mutateAsync(viewModel.casoId);
      toast.success(res.message ?? "Caso finalizado com sucesso.");
      setExpanded(false);
      closePipWindow();
      invalidateCasoAbertoAtivo(queryClient);
      invalidateProjetoMemoriaForRegistro(queryClient, viewModel.casoId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao finalizar caso.");
      throw e;
    }
  };

  const handleAbrirPip = async () => {
    if (!isPipSupported) {
      toast.error("Picture-in-Picture não é suportado neste navegador.");
      return;
    }

    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      setPipWindow(pipWindowRef.current);
      return;
    }

    try {
      const nextPip = await openCasoAbertoPipWindow("expanded");
      pipWindowRef.current = nextPip;
      setPipWindow(nextPip);

      nextPip.addEventListener("pagehide", () => {
        if (pipWindowRef.current === nextPip) {
          pipWindowRef.current = null;
          setPipWindow(null);
        }
      });
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Não foi possível abrir o Picture-in-Picture.",
      );
    }
  };

  return (
    <>
      <CasoAbertoMiniPlayerShell>
        <AnimatePresence mode="wait">
          {expanded ? (
            <CasoAbertoMiniPlayerExpanded
              viewModel={viewModel}
              onCollapse={() => setExpanded(false)}
              onVerCaso={handleVerCaso}
              onFinalizarCaso={handleAbrirModalFinalizar}
              onParar={handleParar}
              onCopiarCommit={() => void handleCopiarCommit()}
              onCopiarTextoCompleto={() => void handleCopiarTextoCompleto()}
              onAbrirPip={() => void handleAbrirPip()}
              isParando={pararProducao.isPending}
              isFinalizando={finalizarCaso.isPending}
              isPipOpen={pipWindow != null && !pipWindow.closed}
              isPipSupported={isPipSupported}
            />
          ) : (
            <CasoAbertoMiniPlayerCollapsed
              viewModel={viewModel}
              onExpand={() => setExpanded(true)}
            />
          )}
        </AnimatePresence>
      </CasoAbertoMiniPlayerShell>

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
