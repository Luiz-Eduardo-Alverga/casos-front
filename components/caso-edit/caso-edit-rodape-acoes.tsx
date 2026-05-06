"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X } from "lucide-react";
import { useSidebar } from "@/components/sidebar/sidebar-provider";

import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { useCasoProducaoActions } from "@/components/caso-resumo-modal/use-caso-producao-actions";
import { CasoProducaoActionButton } from "@/components/caso-resumo-modal/caso-producao-action-button";
import { useCasoEdit } from "./caso-edit-context";
import { useCasoForm } from "../caso-form";

function parseDataAbertura(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (soData) {
    const y = Number(soData[1]);
    const m = Number(soData[2]);
    const d = Number(soData[3]);
    return new Date(y, m - 1, d);
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function montarTextoAbertura(
  tipoAbertura: string,
  dataAbertura: string | undefined,
  usuarioAbertura: string | undefined,
): string {
  const entidade = tipoAbertura === "REPORT" ? "Report" : "Caso";
  const nomeTrim = usuarioAbertura?.trim();
  const porUsuario = nomeTrim ? ` por ${nomeTrim}` : "";
  const dataStr = dataAbertura?.trim();

  if (!dataStr) {
    return `${entidade} aberto${porUsuario}.`;
  }

  const parsed = parseDataAbertura(dataStr);
  if (!parsed) {
    return `${entidade} aberto${porUsuario}.`;
  }

  const hora = format(parsed, "HH:mm", { locale: ptBR });
  const diaPorExtenso = format(parsed, "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return `${entidade} aberto${porUsuario} às ${hora} horas em ${diaPorExtenso}.`;
}

export interface CasoEditRodapeAcoesProps {
  tempoStatus?: string;
  statusTempo?: string;
  onCancelar: () => void;
  onRedirecionarParaAbaProducao?: () => void;
  dataAbertura?: string;
  usuarioAbertura?: string;
}

export function CasoEditRodapeAcoes({
  tempoStatus,
  statusTempo,
  onCancelar,
  onRedirecionarParaAbaProducao,
  dataAbertura,
  usuarioAbertura,
}: CasoEditRodapeAcoesProps) {
  const {
    numeroCaso: casoId,
    isSaving: isLoading,
    canEditCase,
    invalidate: onProducaoAlterada,
    onSalvar,
  } = useCasoEdit();

  const { editCaseItem } = useCasoForm();
  const tipoAbertura =
    editCaseItem?.caso?.caracteristicas?.tipo_abertura ?? "CASO";

  const textoAbertura = useMemo(
    () => montarTextoAbertura(tipoAbertura, dataAbertura, usuarioAbertura),
    [tipoAbertura, dataAbertura, usuarioAbertura],
  );

  const disabled = isLoading || !canEditCase;
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
        className="fixed bottom-0 z-30 border-t border-border-divider bg-card shadow-card transition-all duration-300 px-6 py-4 flex flex-row justify-between items-center gap-2"
        style={{
          left: isMobile ? "0" : isCollapsed ? "64px" : "256px",
          right: "0",
          width: isMobile
            ? "100%"
            : `calc(100% - ${isCollapsed ? "64px" : "256px"})`,
        }}
      >
        <div className="flex flex-row flex-wrap gap-2 min-w-0 sr-only sm:not-sr-only">
          <span className="text-sm text-text-secondary font-semibold">
            {textoAbertura}
          </span>
        </div>

        <div className="flex flex-row gap-2">
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
        </div>
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
