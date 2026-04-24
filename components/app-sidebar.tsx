"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  Grid3x3,
  FileText,
  ChevronRight,
  Kanban,
  Database,
  type LucideIcon,
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
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import {
  SidebarCollapsibleGroup,
  type SidebarSubitem as SidebarSubitemBase,
} from "@/components/sidebar-collapsible-group";

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

type MainNavEntry =
  | ({ type: "link" } & SidebarLinkConfig)
  | {
      type: "group";
      order: number;
      key: "cadastros" | "configuracoes";
      label: string;
      icon: LucideIcon;
      collapsedHref: string;
      subitems: SidebarSubitemBase[];
    };

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
  {
    type: "group",
    order: 50,
    key: "cadastros",
    label: "Cadastros Smart",
    icon: Database,
    collapsedHref: CADASTROS_COLLAPSED_HREF,
    subitems: CADASTROS_SUBITEMS_SORTED.map((s) => ({
      label: s.label,
      href: s.href,
      exact: s.exact,
    })),
  },
  // Se quiser reativar o grupo, descomente:
  // {
  //   type: "group",
  //   order: 60,
  //   key: "configuracoes",
  //   label: "Configurações",
  //   icon: Shield,
  //   collapsedHref: CONFIGURACOES_COLLAPSED_HREF,
  //   subitems: CONFIGURACOES_SUBITEMS_SORTED.map((s) => ({
  //     label: s.label,
  //     href: s.href,
  //     exact: s.exact,
  //   })),
  // },
];

const MAIN_NAV_SORTED = [...MAIN_NAV].sort((a, b) => a.order - b.order);

export function AppSidebar({
  isCollapsed,
  isMobileOpen,
  isMobile,
}: AppSidebarProps) {
  const pathname = usePathname();
  const rbacReady = permissionsLoaded();
  const canListAcquirer = !rbacReady || hasPermission("list-acquirer");
  const mainNavSorted = canListAcquirer
    ? MAIN_NAV_SORTED
    : MAIN_NAV_SORTED.filter((entry) => {
        if (entry.type !== "link") return true;
        return entry.href !== "/cadastros/adquirentes/status";
      });
  const cadastrosSubitemsSorted = canListAcquirer ? CADASTROS_SUBITEMS_SORTED : [];
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
          {mainNavSorted.map((entry) => {
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

            const open =
              entry.key === "cadastros" ? cadastrosOpen : configuracoesOpen;
            const onOpenChange =
              entry.key === "cadastros"
                ? setCadastrosOpen
                : setConfiguracoesOpen;
            const subitems =
              entry.key === "cadastros"
                ? cadastrosSubitemsSorted.map((s) => ({
                    label: s.label,
                    href: s.href,
                    exact: s.exact,
                  }))
                : entry.subitems;

            return (
              <span key={entry.key} className="contents">
                <SidebarCollapsibleGroup
                  isCollapsed={isCollapsed}
                  pathname={pathname}
                  open={open}
                  onOpenChange={onOpenChange}
                  collapsedHref={entry.collapsedHref}
                  label={entry.label}
                  icon={entry.icon}
                  subitems={subitems}
                  titleWhenCollapsed={
                    entry.key === "cadastros" ? "Cadastros" : "Configurações"
                  }
                />
              </span>
            );
          })}
        </SidebarNav>
      </SidebarContent>
    </Sidebar>
  );
}
