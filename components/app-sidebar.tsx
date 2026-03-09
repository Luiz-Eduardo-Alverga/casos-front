"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Grid3x3,
  FileText,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarSection,
  SidebarNav,
  SidebarNavItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  isMobile: boolean;
}

interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: "Avisos", href: "/avisos", icon: Bell },
  { label: "Painel do desenvolvedor", href: "/painel", icon: Grid3x3 },
  { label: "Casos", href: "/casos", icon: FileText },
];

export function AppSidebar({
  isCollapsed,
  isMobileOpen,
  isMobile,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar
      isCollapsed={isCollapsed}
      isMobileOpen={isMobileOpen}
      isMobile={isMobile}
    >
      <SidebarHeader className="justify-center py-10">
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
          {SIDEBAR_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="block w-full"
              >
                <SidebarNavItem
                  isActive={isActive}
                  className={cn("w-full", isCollapsed && "justify-center")}
                >
                  {isCollapsed ? (
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />
                    </>
                  )}
                </SidebarNavItem>
              </Link>
            );
          })}
        </SidebarNav>
      </SidebarContent>
    </Sidebar>
  );
}
