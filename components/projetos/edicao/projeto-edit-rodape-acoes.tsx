"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/sidebar/sidebar-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ProjetoEditRodapeAcoesProps {
  formId: string;
  registro: number;
  nomeProjeto: string;
  isSaving: boolean;
  canEdit: boolean;
  onCancelar: () => void;
}

export function ProjetoEditRodapeAcoes({
  formId,
  registro,
  nomeProjeto,
  isSaving,
  canEdit,
  onCancelar,
}: ProjetoEditRodapeAcoesProps) {
  const { isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const resumo =
    nomeProjeto.trim().length > 0
      ? `#${registro} — ${nomeProjeto.trim()}`
      : `#${registro}`;

  const salvarDisabled = isSaving || !canEdit;
  const showSemPermissaoTooltip = !canEdit && !isSaving;

  return (
    <TooltipProvider>
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
        <span className="hidden min-w-0 truncate text-sm font-semibold text-text-secondary sm:block">
          {resumo}
        </span>

        <div className="ml-auto flex flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancelar}
            disabled={isSaving}
            className="w-48 px-4"
          >
            <X className="mr-2 h-3.5 w-3.5" />
            Cancelar
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  type="submit"
                  form={formId}
                  disabled={salvarDisabled}
                  className="w-48 px-4"
                  aria-disabled={salvarDisabled}
                >
                  {isSaving ? (
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
              </span>
            </TooltipTrigger>
            {showSemPermissaoTooltip && (
              <TooltipContent>
                Você não possui permissão para editar este projeto.
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </footer>
    </TooltipProvider>
  );
}
