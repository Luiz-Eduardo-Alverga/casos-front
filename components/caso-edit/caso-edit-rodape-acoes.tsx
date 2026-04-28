"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X } from "lucide-react";
import { useSidebar } from "@/components/sidebar/sidebar-provider";

import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { useCasoProducaoActions } from "@/components/caso-resumo-modal/use-caso-producao-actions";
import { CasoProducaoActionButton } from "@/components/caso-resumo-modal/caso-producao-action-button";

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
  const {
    iniciarProducao,
    pararProducao,
    handleIniciar,
    handleParar,
    casoAbertoModalOpen,
    setCasoAbertoModalOpen,
    setCasoAbertoId,
    tempoEstimadoModalOpen,
    setTempoEstimadoModalOpen,
    handleConfirmarVisualizarCaso,
    handleIrParaAbaProducao,
  } = useCasoProducaoActions({
    casoId,
    onProducaoAlterada,
    onRedirecionarParaAbaProducao,
  });

  const showIniciar = tempoStatus === "INICIAR" && statusTempo === "PARADO";
  const showParar = tempoStatus === "PARAR" && statusTempo === "INICIADO";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      <footer
        className="fixed bottom-0 z-30 border-t border-border-divider bg-card shadow-card transition-all duration-300 px-6 py-4 flex flex-row justify-end gap-2"
        style={{
          left: isMobile ? "0" : isCollapsed ? "64px" : "256px",
          right: "0",
          width: isMobile
            ? "100%"
            : `calc(100% - ${isCollapsed ? "64px" : "256px"})`,
        }}
      >
        {showIniciar && (
          <CasoProducaoActionButton
            mode="iniciar"
            onClick={handleIniciar}
            disabled={isLoading || disabled}
            isPending={iniciarProducao.isPending}
          />
        )}
        {showParar && (
          <CasoProducaoActionButton
            mode="parar"
            onClick={handleParar}
            disabled={isLoading || disabled}
            isPending={pararProducao.isPending}
          />
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
          if (!open) {
            setCasoAbertoId(null);
          }
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
