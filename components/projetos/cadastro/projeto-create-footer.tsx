"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/sidebar/sidebar-provider";

export interface ProjetoCreateFooterProps {
  formId: string;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function ProjetoCreateFooter({
  formId,
  isSubmitting,
  onCancel,
}: ProjetoCreateFooterProps) {
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
      className="fixed bottom-0 z-30 flex flex-row items-center justify-end gap-2 border-t border-border-divider bg-card px-6 py-4 shadow-card transition-all duration-300"
      style={{
        left: isMobile ? "0" : isCollapsed ? "64px" : "256px",
        right: "0",
        width: isMobile
          ? "100%"
          : `calc(100% - ${isCollapsed ? "64px" : "256px"})`,
      }}
    >
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="w-48 px-4"
      >
        <X className="mr-2 h-3.5 w-3.5" />
        Cancelar
      </Button>
      <Button
        type="submit"
        form={formId}
        disabled={isSubmitting}
        className="w-48 px-4"
      >
        {isSubmitting ? (
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
    </footer>
  );
}
