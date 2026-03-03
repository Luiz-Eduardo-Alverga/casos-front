"use client";

import Image from "next/image";
import { FileText, Grid3x3, ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarSection,
  SidebarNav,
  SidebarNavItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

interface AppSidebarProps {
  isCollapsed: boolean;
}

export function AppSidebar({ isCollapsed }: AppSidebarProps) {
  const pathname = usePathname();
  const isCasosActive = pathname?.includes("/casos");

  return (
    <Sidebar isCollapsed={isCollapsed}>
      <SidebarHeader className="justify-center">
        {isCollapsed ? (
          <Image
            src="/images/icon.png"
            alt="Softflow"
            width={32}
            height={32}
            className="object-contain"
            unoptimized
          />
        ) : (
          <Image
            src="/images/softflow.svg"
            alt="Softflow"
            width={157}
            height={45}
            className="object-contain"
            unoptimized
          />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarSection>
          {!isCollapsed && (
            <p className="text-sidebar-text-secondary text-xs font-semibold uppercase tracking-[0.6px]">
              Navegação
            </p>
          )}
        </SidebarSection>

        <SidebarNav className={isCollapsed ? "items-center" : ""}>
          <SidebarNavItem isActive={isCasosActive} className={isCollapsed ? "justify-center w-full" : ""}>
            {isCollapsed ? (
              <FileText className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span>Casos</span>
                </div>
                <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />
              </>
            )}
          </SidebarNavItem>

          <SidebarNavItem className={isCollapsed ? "justify-center w-full" : ""}>
            {isCollapsed ? (
              <Grid3x3 className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Grid3x3 className="h-3.5 w-3.5 shrink-0" />
                  <span>Diversos</span>
                </div>
                <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />
              </>
            )}
          </SidebarNavItem>
        </SidebarNav>
      </SidebarContent>
    </Sidebar>
  );
}
