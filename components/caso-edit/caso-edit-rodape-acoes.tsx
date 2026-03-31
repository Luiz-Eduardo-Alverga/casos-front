"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Pause, Play, Save, X } from "lucide-react";
import { useSidebar } from "@/components/sidebar-provider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useIniciarProducao } from "@/hooks/use-iniciar-producao";
import { usePararProducao } from "@/hooks/use-parar-producao";
import { IniciarProducaoError } from "@/services/projeto-casos-producao/iniciar-producao";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";

export interface CasoEditRodapeAcoesProps {
  casoId: number | string;
  tempoStatus?: string;
  statusTempo?: string;
  onSalvar: () => void;
  onCancelar: () => void;
  onProducaoAlterada?: () => void;
  onRedirecionarParaAbaProducao?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function CasoEditRodapeAcoes({
  casoId,
  tempoStatus,
  statusTempo,
  onSalvar,
  onCancelar,
  onProducaoAlterada,
  onRedirecionarParaAbaProducao,
  isLoading = false,
  disabled = false,
}: CasoEditRodapeAcoesProps) {
  const { isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const [casoAbertoModalOpen, setCasoAbertoModalOpen] = useState(false);
  const [casoAbertoId, setCasoAbertoId] = useState<number | null>(null);
  const [tempoEstimadoModalOpen, setTempoEstimadoModalOpen] = useState(false);
  const router = useRouter();

  const iniciarProducao = useIniciarProducao();
  const pararProducao = usePararProducao();

  const showIniciar = tempoStatus === "INICIAR" && statusTempo === "PARADO";
  const showParar = tempoStatus === "PARAR" && statusTempo === "INICIADO";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  return (
    <>
      <footer
        className="fixed bottom-0 z-30 border-t border-border-divider bg-card shadow-[0_-1px_3px_0_rgba(0,0,0,0.05)] transition-all duration-300 px-6 py-4 flex flex-row justify-end gap-2"
        style={{
          left: isMobile ? "0" : isCollapsed ? "64px" : "256px",
          right: "0",
          width: isMobile
            ? "100%"
            : `calc(100% - ${isCollapsed ? "64px" : "256px"})`,
        }}
      >
        {showIniciar && (
          <Button
            type="button"
            onClick={handleIniciar}
            disabled={isLoading || disabled || iniciarProducao.isPending}
            className="w-48 px-4 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {iniciarProducao.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                Iniciando...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-2" />
                Iniciar
              </>
            )}
          </Button>
        )}
        {showParar && (
          <Button
            type="button"
            onClick={handleParar}
            disabled={isLoading || disabled || pararProducao.isPending}
            className="w-48 px-4 bg-red-600 hover:bg-red-700 text-white"
          >
            {pararProducao.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                Parando...
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 mr-2" />
                Parar
              </>
            )}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onCancelar}
          disabled={isLoading || disabled}
          className="w-48 px-4"
        >
          <X className="h-3.5 w-3.5 mr-2" />
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={onSalvar}
          disabled={isLoading || disabled}
          className="w-48 px-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5 mr-2" />
              <span>Salvar</span>
            </>
          )}
        </Button>
      </footer>

      <ConfirmacaoModal
        open={casoAbertoModalOpen}
        onOpenChange={(open) => {
          setCasoAbertoModalOpen(open);
          if (!open) setCasoAbertoId(null);
        }}
        titulo="Caso em produção"
        descricao="Já existe um caso em produção. Deseja visualizar o caso aberto?"
        confirmarLabel="Visualizar caso"
        cancelarLabel="Cancelar"
        onConfirm={handleConfirmarVisualizarCaso}
      />

      <ConfirmacaoModal
        open={tempoEstimadoModalOpen}
        onOpenChange={setTempoEstimadoModalOpen}
        titulo="Planejamento necessário"
        descricao="Este caso ainda não possui um tempo estimado. Deseja lançar uma estimativa ou marcar como não planejado?"
        confirmarLabel="Ir para aba Produção"
        cancelarLabel="Cancelar"
        onConfirm={handleIrParaAbaProducao}
      />
    </>
  );
}
