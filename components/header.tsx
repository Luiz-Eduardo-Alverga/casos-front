"use client";

import {
  Menu,
  Plus,
  Maximize,
  Minimize,
  ExternalLink,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDropDown } from "@/components/user-dropdown";
import { useSidebar } from "@/components/sidebar-provider";
import { AvisosDropdown } from "@/components/avisos/avisos-dropdown";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CasoResumoModal } from "@/components/caso-resumo-modal";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

export function Header() {
  const { toggleSidebar, isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [openCaseSearch, setOpenCaseSearch] = useState(false);
  const router = useRouter();
  const handleToggleFullScreen = () => {
    // Verifica se já estamos em tela cheia
    if (!document.fullscreenElement) {
      // Se não estiver, solicita a entrada
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Erro ao tentar ativar tela cheia: ${e.message}`);
      });
      setIsFullScreen(true);
    } else {
      // Se já estiver, solicita a saída
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() !== "k") return;

      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      event.preventDefault();
      setOpenCaseSearch(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header
      className="fixed bg-white border-b border-border top-0 z-30 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] transition-all duration-300"
      style={{
        left: isMobile ? "0" : isCollapsed ? "64px" : "256px",
        right: "0",
        width: isMobile
          ? "100%"
          : `calc(100% - ${isCollapsed ? "64px" : "256px"})`,
      }}
    >
      <div className="flex items-center justify-between px-6 h-[60px] w-full">
        <div className="flex items-center gap-2 lg:space-x-2 ">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-muted"
            onClick={toggleSidebar}
          >
            <Menu className="h-[18px] w-[15.75px] text-foreground" />
          </Button>

          <Button
            onClick={() => {
              router.push("/casos/novo");
            }}
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial bg-[#F8D33E] text-black hover:bg-[#F8D33E]/80"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Caso
          </Button>

          <Separator
            orientation="vertical"
            className="h-8 w-px bg-border-input"
          />

          <Button
            type="button"
            variant="outline"
            className={cn(
              "hidden lg:flex items-center gap-4 h-10 min-w-[320px] justify-between rounded-lg bg-muted/30 text-foreground",
            )}
            onClick={() => setOpenCaseSearch(true)}
          >
            <span className="text-sm font-normal">Pesquisar caso</span>
            <span className="inline-flex items-center gap-2 text-xs font-medium">
              Ctrl+K
              <span className="h-5 w-px bg-border-input" />
              <Search className="h-4 w-4" />
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <AvisosDropdown />

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-muted"
            onClick={() => {
              window.open("/adquirentes", "_blank");
            }}
          >
            <ExternalLink className="h-[18px] w-[15.75px] text-foreground" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-muted sr-only lg:not-sr-only"
            onClick={handleToggleFullScreen}
          >
            {isFullScreen ? (
              <Minimize className="h-[18px] w-[15.75px] text-foreground" />
            ) : (
              <Maximize className="h-[18px] w-[15.75px] text-foreground" />
            )}
          </Button>

          <div className="h-8 w-px bg-border-input" />

          <UserDropDown />
        </div>
      </div>
      <CasoResumoModal
        open={openCaseSearch}
        onOpenChange={setOpenCaseSearch}
        variant="pesquisa"
      />
    </header>
  );
}
