"use client";

import {
  Menu,
  Plus,
  Maximize,
  Minimize,
  ExternalLink,
  Search,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDropDown } from "@/components/header/user-dropdown";
import { useSidebar } from "@/components/sidebar/sidebar-provider";
import { AvisosDropdown } from "@/components/avisos/avisos-dropdown";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CasoResumoModal } from "@/components/caso-resumo-modal";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { useTheme } from "next-themes";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";

export function Header() {
  const { toggleSidebar, isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [openCaseSearch, setOpenCaseSearch] = useState(false);
  const [themeMounted, setThemeMounted] = useState(false);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const rbacReady = permissionsLoaded();
  const canCreateCase = !rbacReady || hasPermission("create-case");
  const canCreateReport = !rbacReady || hasPermission("create-report");

  useEffect(() => setThemeMounted(true), []);
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
    <>
      <header
        className="fixed bg-background border-b border-border top-0 z-30 shadow-card transition-all duration-300"
        style={{
          left: isMobile ? "0" : isCollapsed ? "64px" : "256px",
          right: "0",
          width: isMobile
            ? "100%"
            : `calc(100% - ${isCollapsed ? "64px" : "256px"})`,
        }}
      >
        <div className="relative flex items-center justify-between px-2 sm:px-6 h-[60px] w-full">
          {/* Busca central no mobile */}
          <Button
            type="button"
            variant="outline"
            className={cn(
              "lg:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "items-center gap-4 h-10 justify-between rounded-lg bg-muted/30 text-foreground",
              "w-[min(70vw,360px)]",
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

          <div className="flex items-center gap-2 lg:space-x-2 ">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-muted"
              onClick={toggleSidebar}
            >
              <Menu className="h-[18px] w-[15.75px] text-foreground" />
            </Button>

            {canCreateCase && (
              <Button
                onClick={() => {
                  router.push("/casos/novo");
                }}
                type="button"
                className="hidden lg:inline-flex w-full sm:w-auto px-4 flex-1 sm:flex-initial bg-brand-yellow text-black hover:bg-brand-yellow-hover"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar Caso
              </Button>
            )}

            {canCreateReport && (
              <Button
                onClick={() => {
                  router.push("/reports/novo");
                }}
                type="button"
                className="hidden lg:inline-flex w-full sm:w-auto px-4 flex-1 sm:flex-initial bg-brand-yellow text-black hover:bg-brand-yellow-hover"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar Report
              </Button>
            )}

            <Separator
              orientation="vertical"
              className="hidden lg:block h-8 w-px bg-border-input"
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
              className="sr-only lg:not-sr-only h-9 w-9 hover:bg-muted"
              onClick={() => {
                window.open("/adquirentes", "_blank");
              }}
            >
              <ExternalLink className="h-[18px] w-[15.75px] text-foreground" />
            </Button>

            {/* {themeMounted ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-muted"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              aria-label={
                resolvedTheme === "dark"
                  ? "Alternar para tema claro"
                  : "Alternar para tema escuro"
              }
              title={
                resolvedTheme === "dark"
                  ? "Alternar para tema claro"
                  : "Alternar para tema escuro"
              }
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-[18px] w-[15.75px] text-foreground" />
              ) : (
                <Moon className="h-[18px] w-[15.75px] text-foreground" />
              )}
            </Button>
          ) : null} */}

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

            <div className="hidden lg:block h-8 w-px bg-border-input" />

            <UserDropDown />
          </div>
        </div>
        <CasoResumoModal
          open={openCaseSearch}
          onOpenChange={setOpenCaseSearch}
          variant="pesquisa"
        />
      </header>

      {/* FAB: Adicionar Caso/Report (somente mobile) */}
      {canCreateCase ? (
        <Button
          type="button"
          aria-label="Adicionar caso"
          className={cn(
            "fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full p-0",
            "bg-brand-yellow text-black shadow-lg hover:bg-brand-yellow-hover",
            "lg:hidden",
          )}
          onClick={() => router.push("/casos/novo")}
        >
          <Plus className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          type="button"
          aria-label="Adicionar report"
          className={cn(
            "fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full p-0",
            "bg-brand-yellow text-black shadow-lg hover:bg-brand-yellow-hover",
            "lg:hidden",
          )}
          onClick={() => router.push("/reports/novo")}
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}
