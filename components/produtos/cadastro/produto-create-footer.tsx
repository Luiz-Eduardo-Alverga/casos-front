"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/sidebar/sidebar-provider";
import { PRODUTO_LABELS } from "@/components/produtos/constants";

export interface ProdutoCreateFooterProps {
  formId: string;
  isSubmitting: boolean;
  isSaving?: boolean;
  onCancel: () => void;
}

export function ProdutoCreateFooter({
  formId,
  isSubmitting,
  isSaving = false,
  onCancel,
}: ProdutoCreateFooterProps) {
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
      <p className="min-w-0 text-sm text-muted-foreground">
        {PRODUTO_LABELS.footerNovoHint}
      </p>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full px-4 sm:w-48"
        >
          <X className="h-4 w-4" />
          {PRODUTO_LABELS.cancelar}
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
              {PRODUTO_LABELS.criando}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {PRODUTO_LABELS.criarProduto}
            </>
          )}
        </Button>
      </div>
    </footer>
  );
}
