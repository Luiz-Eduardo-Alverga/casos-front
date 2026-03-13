"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X } from "lucide-react";
import { useSidebar } from "@/components/sidebar-provider";
import { useRouter } from "next/navigation";

export interface CasoEditRodapeAcoesProps {
  onSalvar: () => void;
  onCancelar: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function CasoEditRodapeAcoes({
  onSalvar,
  onCancelar,
  isLoading = false,
  disabled = false,
}: CasoEditRodapeAcoesProps) {
  const { isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
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
      <Button
        type="button"
        variant="outline"
        onClick={() => router.back()}
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
  );
}
