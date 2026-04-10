"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  Grid3x3,
  FileText,
  ChevronRight,
  ChevronDown,
  Database,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  /** Se true, só ativa com pathname exato (evita /painel ativo em /painel/kanban). */
  exact?: boolean;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: "Avisos", href: "/avisos", icon: Bell },
  {
    label: "Painel do desenvolvedor",
    href: "/painel",
    icon: Grid3x3,
    exact: true,
  },
  { label: "Casos", href: "/casos", icon: FileText },
];

const CADASTROS_SUBITEMS: { label: string; href: string }[] = [
  { label: "Adquirentes", href: "/cadastros/adquirentes" },
  { label: "Versões", href: "/cadastros/versoes" },
  { label: "Dispositivos", href: "/cadastros/dispositivos" },
];

export function AppSidebar({
  isCollapsed,
  isMobileOpen,
  isMobile,
}: AppSidebarProps) {
  const pathname = usePathname();
  const underCadastros = Boolean(pathname?.startsWith("/cadastros"));
  const [cadastrosOpen, setCadastrosOpen] = useState(underCadastros);

  useEffect(() => {
    if (underCadastros) setCadastrosOpen(true);
    else setCadastrosOpen(false);
  }, [underCadastros]);

  const cadastrosGroupActive = CADASTROS_SUBITEMS.some(
    (s) => pathname === s.href || pathname?.startsWith(`${s.href}/`),
  );

  function renderNavItem(item: SidebarItem) {
    const isActive = item.exact
      ? pathname === item.href
      : pathname === item.href ||
        (item.href !== "/" &&
          Boolean(pathname?.startsWith(`${item.href}/`)));
    const Icon = item.icon;
    return (
      <Link key={item.href} href={item.href} className="block w-full">
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
  }

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
          {renderNavItem(SIDEBAR_ITEMS[0])}
          {renderNavItem(SIDEBAR_ITEMS[1])}

          {isCollapsed ? (
            <Link
              href="/cadastros/adquirentes"
              className="block w-full"
              title="Cadastros"
            >
              <SidebarNavItem
                isActive={cadastrosGroupActive}
                className="w-full justify-center"
              >
                <Database className="h-3.5 w-3.5 shrink-0" />
              </SidebarNavItem>
            </Link>
          ) : (
            <Collapsible open={cadastrosOpen} onOpenChange={setCadastrosOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-4 py-3 rounded text-sm font-normal transition-colors",
                    cadastrosGroupActive
                      ? "bg-white/5 border-l-[3px] border-[#F8D33E] text-sidebar-text"
                      : "text-sidebar-text hover:bg-white/5",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Database className="h-3.5 w-3.5 shrink-0" />
                    <span>Cadastros</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 opacity-70 transition-transform",
                      cadastrosOpen && "rotate-180",
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col gap-0.5 pl-2 pt-1 pb-1">
                {CADASTROS_SUBITEMS.map((sub) => {
                  const subActive =
                    pathname === sub.href ||
                    pathname?.startsWith(`${sub.href}/`);
                  return (
                    <Link key={sub.href} href={sub.href} className="block w-full">
                      <span
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2.5 pl-8 rounded text-sm transition-colors",
                          subActive
                            ? "bg-white/5 text-sidebar-text font-medium border-l-[3px] border-[#F8D33E] ml-[-3px]"
                            : "text-sidebar-text/90 hover:bg-white/5",
                        )}
                      >
                        {sub.label}
                      </span>
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          )}

          {renderNavItem(SIDEBAR_ITEMS[2])}
        </SidebarNav>
      </SidebarContent>
    </Sidebar>
  );
}
