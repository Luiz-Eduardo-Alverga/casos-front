"use client"

import { Reports } from "@/components/reports";
import { ProtectedRoute } from "@/components/protected-route";
import { SidebarProvider } from "@/components/sidebar-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { useSidebar } from "@/components/sidebar-provider";
import { useEffect, useState } from "react";

function CasosPageContent() {
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
          marginLeft: isMobile ? "0" : (isCollapsed ? "64px" : "256px")
        }}
      >
        <Reports />
      </div>
    </div>
  );
}

export default function CasosPage() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <CasosPageContent />
      </SidebarProvider>
    </ProtectedRoute>
  );
}
