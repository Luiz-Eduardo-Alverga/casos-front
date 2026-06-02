"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Check, X } from "lucide-react";
import { useSidebar } from "@/components/sidebar/sidebar-provider";
import { useCasoEdit } from "@/components/casos/edicao/caso-edit-context";

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

function montarTextoAberturaReport(
  dataAbertura: string | undefined,
  usuarioAbertura: string | undefined,
): string {
  const nomeTrim = usuarioAbertura?.trim();
  const porUsuario = nomeTrim ? ` por ${nomeTrim}` : "";
  const dataStr = dataAbertura?.trim();

  if (!dataStr) {
    return `Report aberto${porUsuario}.`;
  }

  const parsed = parseDataAbertura(dataStr);
  if (!parsed) {
    return `Report aberto${porUsuario}.`;
  }

  const hora = format(parsed, "HH:mm", { locale: ptBR });
  const diaPorExtenso = format(parsed, "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return `Report aberto${porUsuario} às ${hora} horas em ${diaPorExtenso}.`;
}

export interface ReportEditRodapeAcoesProps {
  onCancelar: () => void;
  dataAbertura?: string;
  usuarioAbertura?: string;
}

export function ReportEditRodapeAcoes({
  onCancelar,
  dataAbertura,
  usuarioAbertura,
}: ReportEditRodapeAcoesProps) {
  const { isSaving: isLoading, canEditCase, onSalvar } = useCasoEdit();

  const textoAbertura = useMemo(
    () => montarTextoAberturaReport(dataAbertura, usuarioAbertura),
    [dataAbertura, usuarioAbertura],
  );

  const disabled = isLoading || !canEditCase;
  const { isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <footer
      className="fixed bottom-0 z-30 flex flex-row items-center justify-between gap-2 border-t border-border-divider bg-card px-6 py-4 shadow-card transition-all duration-300"
      style={{
        left: isMobile ? "0" : isCollapsed ? "64px" : "256px",
        right: "0",
        width: isMobile
          ? "100%"
          : `calc(100% - ${isCollapsed ? "64px" : "256px"})`,
      }}
    >
      <div className="flex min-w-0 flex-row flex-wrap gap-2 sr-only sm:not-sr-only">
        <span className="text-sm font-semibold text-text-secondary">
          {textoAbertura}
        </span>
      </div>

      <div className="flex flex-row gap-2">
        <Button
          type="button"
          className="w-auto bg-[#50d283] px-6 text-white hover:bg-[#50d283]/90"
          onClick={() => {}}
        >
          <Check className="mr-2 h-3.5 w-3.5" />
          Concluir Requisito Pendente
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancelar}
          disabled={isLoading}
          className="w-48 px-4"
        >
          <X className="mr-2 h-3.5 w-3.5" />
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={onSalvar}
          disabled={disabled}
          className="w-48 px-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-3.5 w-3.5" />
              Salvar
            </>
          )}
        </Button>
      </div>
    </footer>
  );
}
