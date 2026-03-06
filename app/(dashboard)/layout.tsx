"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { SidebarProvider } from "@/components/sidebar-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/components/sidebar-provider";
import { useEffect, useState } from "react";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

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
      <AppSidebar isCollapsed={isCollapsed} isMobileOpen={isMobileOpen} isMobile={isMobile} />

      {/* Overlay para mobile */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}

      <div
        className="flex-1 transition-all duration-300 w-full overflow-hidden"
        style={{
          marginLeft: isMobile ? "0" : (isCollapsed ? "64px" : "256px"),
        }}
      >
        <Header />
        <div className="min-h-screen bg-page-background flex flex-col">
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
