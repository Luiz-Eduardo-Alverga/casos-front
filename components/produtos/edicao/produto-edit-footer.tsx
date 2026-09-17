"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/sidebar/sidebar-provider";
import { PRODUTO_LABELS } from "@/components/produtos/constants";

export interface ProdutoEditFooterProps {
  formId: string;
  isSubmitting: boolean;
  isSaving?: boolean;
  onDiscard: () => void;
}

export function ProdutoEditFooter({
  formId,
  isSubmitting,
  isSaving = false,
  onDiscard,
}: ProdutoEditFooterProps) {
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
      className="fixed bottom-0 z-30 flex flex-col gap-4 border-t border-border-divider bg-card px-6 py-4 shadow-card transition-all duration-300 sm:flex-row sm:items-center sm:justify-between"
      style={{
        left: isMobile ? "0" : isCollapsed ? "64px" : "256px",
        right: "0",
        width: isMobile
          ? "100%"
          : `calc(100% - ${isCollapsed ? "64px" : "256px"})`,
      }}
    >
      <p className="flex min-w-0 items-center gap-2 text-sm text-text-secondary">
        <span className="size-2 shrink-0 rounded-full bg-status-warning" />
        {PRODUTO_LABELS.alteracoesNaoSalvas}
      </p>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onDiscard}
          disabled={isSubmitting}
          className="w-full px-4 sm:w-48"
        >
          <X className="h-4 w-4" />
          {PRODUTO_LABELS.descartar}
        </Button>
        <Button
          type="submit"
          form={formId}
          disabled={isSubmitting}
          className="w-full px-4 sm:w-48"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {PRODUTO_LABELS.salvando}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {PRODUTO_LABELS.salvarAlteracoes}
            </>
          )}
        </Button>
      </div>
    </footer>
  );
}
