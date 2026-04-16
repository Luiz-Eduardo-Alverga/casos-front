"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useIniciarProducao } from "@/hooks/use-iniciar-producao";
import { usePararProducao } from "@/hooks/use-parar-producao";
import { IniciarProducaoError } from "@/services/projeto-casos-producao/iniciar-producao";

interface UseCasoProducaoActionsParams {
  casoId: number | string;
  onProducaoAlterada?: () => void;
  onRedirecionarParaAbaProducao?: () => void;
}

export function useCasoProducaoActions({
  casoId,
  onProducaoAlterada,
  onRedirecionarParaAbaProducao,
}: UseCasoProducaoActionsParams) {
  const router = useRouter();
  const iniciarProducao = useIniciarProducao();
  const pararProducao = usePararProducao();

  const [casoAbertoModalOpen, setCasoAbertoModalOpen] = useState(false);
  const [casoAbertoId, setCasoAbertoId] = useState<number | null>(null);
  const [tempoEstimadoModalOpen, setTempoEstimadoModalOpen] = useState(false);

  const handleIniciar = () => {
    iniciarProducao.mutate(casoId, {
      onSuccess: () => {
        toast.success("Produção iniciada.");
        onProducaoAlterada?.();
      },
      onError: (e) => {
        if (e instanceof IniciarProducaoError) {
          if (e.code === "CASO_JA_ABERTO") {
            if (e.caso_aberto != null) {
              setCasoAbertoId(e.caso_aberto);
              setCasoAbertoModalOpen(true);
            } else {
              toast.error(e.message);
            }
          } else if (e.code === "TEMPO_ESTIMADO_OBRIGATORIO") {
            setTempoEstimadoModalOpen(true);
          } else {
            toast.error(e.message);
          }
        } else {
          toast.error(
            e instanceof Error ? e.message : "Erro ao iniciar produção.",
          );
        }
      },
    });
  };

  const handleParar = () => {
    pararProducao.mutate(casoId, {
      onSuccess: () => {
        toast.success("Produção parada.");
        onProducaoAlterada?.();
      },
      onError: (e) => {
        toast.error(e instanceof Error ? e.message : "Erro ao parar produção.");
      },
    });
  };

  const handleConfirmarVisualizarCaso = () => {
    if (casoAbertoId != null) {
      router.push(`/casos/${casoAbertoId}`);
    }
    setCasoAbertoModalOpen(false);
    setCasoAbertoId(null);
  };

  const handleIrParaAbaProducao = () => {
    onRedirecionarParaAbaProducao?.();
    setTempoEstimadoModalOpen(false);
  };

  return {
    iniciarProducao,
    pararProducao,
    handleIniciar,
    handleParar,
    casoAbertoModalOpen,
    setCasoAbertoModalOpen,
    casoAbertoId,
    setCasoAbertoId,
    tempoEstimadoModalOpen,
    setTempoEstimadoModalOpen,
    handleConfirmarVisualizarCaso,
    handleIrParaAbaProducao,
  };
}

