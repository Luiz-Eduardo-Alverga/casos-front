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
  Kanban,
  Shield,
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

/** Itens de link da barra lateral. `order` define a posição em relação aos demais e ao bloco Cadastros. */
type SidebarLinkConfig = SidebarItem & { order: number };

/** Bloco único da navegação principal: links + marcadores de grupos colapsáveis. */
type MainNavEntry =
  | ({ type: "link" } & SidebarLinkConfig)
  | { type: "cadastros"; order: number }
  | { type: "configuracoes"; order: number };

const MAIN_NAV: MainNavEntry[] = [
  { type: "link", order: 10, label: "Avisos", href: "/avisos", icon: Bell },
  {
    type: "link",
    order: 20,
    label: "Painel do desenvolvedor",
    href: "/painel",
    icon: Grid3x3,
    exact: true,
  },
  { type: "cadastros", order: 50 },
  // { type: "configuracoes", order: 60 },
  {
    type: "link",
    order: 30,
    label: "Listagem de Casos",
    href: "/casos",
    icon: FileText,
  },
  {
    type: "link",
    order: 40,
    label: "Kanban Adquirentes",
    href: "/cadastros/adquirentes/status",
    icon: Kanban,
  },
];

const MAIN_NAV_SORTED = [...MAIN_NAV].sort((a, b) => a.order - b.order);

interface SidebarSubitem {
  order: number;
  label: string;
  href: string;
  exact?: boolean;
}

const CADASTROS_SUBITEMS: SidebarSubitem[] = [
  {
    order: 20,
    label: "Adquirentes",
    href: "/cadastros/adquirentes",
    exact: true,
  },

  { order: 30, label: "Versões", href: "/cadastros/versoes" },
  { order: 40, label: "Dispositivos", href: "/cadastros/dispositivos" },
];

const CADASTROS_SUBITEMS_SORTED = [...CADASTROS_SUBITEMS].sort(
  (a, b) => a.order - b.order,
);

const CADASTROS_COLLAPSED_HREF =
  CADASTROS_SUBITEMS_SORTED[0]?.href ?? "/cadastros/adquirentes";

const CONFIGURACOES_SUBITEMS: SidebarSubitem[] = [
  { order: 10, label: "Papéis e Acessos", href: "/configuracoes/papeis" },
];

const CONFIGURACOES_SUBITEMS_SORTED = [...CONFIGURACOES_SUBITEMS].sort(
  (a, b) => a.order - b.order,
);

const CONFIGURACOES_COLLAPSED_HREF =
  CONFIGURACOES_SUBITEMS_SORTED[0]?.href ?? "/configuracoes/papeis";

export function AppSidebar({
  isCollapsed,
  isMobileOpen,
  isMobile,
}: AppSidebarProps) {
  const pathname = usePathname();
  const underCadastros = Boolean(pathname?.startsWith("/cadastros"));
  const underConfiguracoes = Boolean(pathname?.startsWith("/configuracoes"));
  const [cadastrosOpen, setCadastrosOpen] = useState(underCadastros);
  const [configuracoesOpen, setConfiguracoesOpen] =
    useState(underConfiguracoes);

  useEffect(() => {
    if (underCadastros) setCadastrosOpen(true);
    else setCadastrosOpen(false);
  }, [underCadastros]);

  useEffect(() => {
    if (underConfiguracoes) setConfiguracoesOpen(true);
    else setConfiguracoesOpen(false);
  }, [underConfiguracoes]);

  const cadastrosGroupActive = CADASTROS_SUBITEMS_SORTED.some((s) =>
    s.exact
      ? pathname === s.href
      : pathname === s.href || pathname?.startsWith(`${s.href}/`),
  );
  const configuracoesGroupActive = CONFIGURACOES_SUBITEMS_SORTED.some((s) =>
    s.exact
      ? pathname === s.href
      : pathname === s.href || pathname?.startsWith(`${s.href}/`),
  );

  function renderNavItem(item: SidebarItem) {
    const isActive = item.exact
      ? pathname === item.href
      : pathname === item.href ||
        (item.href !== "/" && Boolean(pathname?.startsWith(`${item.href}/`)));
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
              {item.href !== CADASTROS_COLLAPSED_HREF &&
                item.href !== CONFIGURACOES_COLLAPSED_HREF && (
                  <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />
                )}
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
          {MAIN_NAV_SORTED.map((entry) => {
            if (entry.type === "link") {
              return (
                <span key={entry.href} className="contents">
                  {renderNavItem({
                    label: entry.label,
                    href: entry.href,
                    icon: entry.icon,
                    exact: entry.exact,
                  })}
                </span>
              );
            }

            if (entry.type === "configuracoes") {
              return (
                <span key="configuracoes" className="contents">
                  {isCollapsed ? (
                    <Link
                      href={CONFIGURACOES_COLLAPSED_HREF}
                      className="block w-full"
                      title="Configurações"
                    >
                      <SidebarNavItem
                        isActive={configuracoesGroupActive}
                        className="w-full justify-center"
                      >
                        <Shield className="h-3.5 w-3.5 shrink-0" />
                      </SidebarNavItem>
                    </Link>
                  ) : (
                    <Collapsible
                      open={configuracoesOpen}
                      onOpenChange={setConfiguracoesOpen}
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "flex w-full items-center justify-between gap-3 px-4 py-3 rounded text-sm font-normal transition-colors",
                            configuracoesGroupActive
                              ? "bg-white/5 border-l-[3px] border-[#F8D33E] text-sidebar-text"
                              : "text-sidebar-text hover:bg-white/5",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Shield className="h-3.5 w-3.5 shrink-0" />
                            <span>Configurações</span>
                          </div>
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 opacity-70 transition-transform",
                              configuracoesOpen && "rotate-180",
                            )}
                          />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="flex flex-col gap-0.5 pl-2 pt-1 pb-1">
                        {CONFIGURACOES_SUBITEMS_SORTED.map((sub) => {
                          const subActive = sub.exact
                            ? pathname === sub.href
                            : pathname === sub.href ||
                              pathname?.startsWith(`${sub.href}/`);
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className="block w-full"
                            >
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
                </span>
              );
            }

            return (
              <span key="cadastros" className="contents">
                {isCollapsed ? (
                  <Link
                    href={CADASTROS_COLLAPSED_HREF}
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
                  <Collapsible
                    open={cadastrosOpen}
                    onOpenChange={setCadastrosOpen}
                  >
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
                          <span>Cadastros Smart</span>
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
                      {CADASTROS_SUBITEMS_SORTED.map((sub) => {
                        const subActive = sub.exact
                          ? pathname === sub.href
                          : pathname === sub.href ||
                            pathname?.startsWith(`${sub.href}/`);
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="block w-full"
                          >
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
              </span>
            );
          })}
        </SidebarNav>
      </SidebarContent>
    </Sidebar>
  );
}
