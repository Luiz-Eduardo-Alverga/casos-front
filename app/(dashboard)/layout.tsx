"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { SidebarProvider } from "@/components/sidebar-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/components/sidebar-provider";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Rotas que devem ter scroll interno (overflow-hidden)
// A maioria das telas terá scroll do navegador
const ROUTES_WITH_INTERNAL_SCROLL = [
  "/avisos",
  "/painel/kanban",
  "/cadastros/adquirentes/status",
];

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Verificar se a rota atual deve ter scroll interno
  const hasInternalScroll = ROUTES_WITH_INTERNAL_SCROLL.includes(pathname);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fechar sidebar ao clicar no overlay em mobile
  const handleOverlayClick = () => {
    if (isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen relative">
      <AppSidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        isMobile={isMobile}
      />

      {/* Overlay para mobile */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}

      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 w-full ${
          hasInternalScroll ? "lg:h-screen overflow-hidden" : ""
        }`}
        style={{
          marginLeft: isMobile ? "0" : isCollapsed ? "64px" : "256px",
        }}
      >
        <Header />
        <div
          className={`flex-1 flex flex-col bg-page-background ${
            hasInternalScroll ? "lg:min-h-0 lg:overflow-hidden" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppLayoutContent>{children}</AppLayoutContent>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
