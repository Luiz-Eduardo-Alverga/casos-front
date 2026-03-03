"use client"

import { Reports } from "@/components/reports";
import { ProtectedRoute } from "@/components/protected-route";
import { SidebarProvider } from "@/components/sidebar-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { useSidebar } from "@/components/sidebar-provider";

function CasosPageContent() {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="flex min-h-screen">
      <AppSidebar isCollapsed={isCollapsed} />
      <div 
        className="flex-1 transition-all duration-300 w-full overflow-hidden"
        style={{ marginLeft: isCollapsed ? "64px" : "256px" }}
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
