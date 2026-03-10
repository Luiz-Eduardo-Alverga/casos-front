"use client";

import {
  Menu,
  Bell,
  Moon,
  Maximize2,
  Minimize2,
  Plus,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDropDown } from "@/components/user-dropdown";
import { useSidebar } from "@/components/sidebar-provider";
import { AvisosDropdown } from "@/components/avisos/avisos-dropdown";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const { toggleSidebar, isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
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
        {/* Menu Hamburger */}

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
            className="w-full sm:w-auto h-[42px] px-4 flex-1 sm:flex-initial bg-[#F8D33E] text-black hover:bg-[#F8D33E]/80"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Caso
          </Button>
        </div>

        {/* Right side - Icons and User */}
        <div className="flex items-center gap-6">
          {/* Notification Bell - abre dropdown de avisos (filtro: mês atual) */}
          <AvisosDropdown />

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

          {/* Vertical Divider */}
          <div className="h-8 w-px bg-border-input" />

          {/* User Dropdown */}
          <UserDropDown />
        </div>
      </div>
    </header>
  );
}
