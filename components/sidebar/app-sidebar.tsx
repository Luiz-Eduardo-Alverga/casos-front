"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Grid3x3,
  FileText,
  FolderKanban,
  Kanban,
  Database,
  type LucideIcon,
  Shield,
  Clock3,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarNav,
  SidebarNavItem,
  SidebarSectionLabel,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  hasAnyPermission,
  hasPermission,
  permissionsLoaded,
} from "@/lib/rbac-client";
import {
  SidebarCollapsibleGroup,
  type SidebarSubitem as SidebarSubitemBase,
} from "@/components/sidebar/sidebar-collapsible-group";

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

const STANDALONE_NAV_ORDERS = new Set([20]);
const GERENCIAR_NAV_ORDERS = new Set([10, 30, 35, 37, 40]);
const RECURSOS_NAV_ORDERS = new Set([50, 60]);

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
  { order: 20, label: "Perfis de acesso", href: "/configuracoes/perfis" },
  { order: 10, label: "Usuários", href: "/configuracoes/usuarios" },
];

const CONFIGURACOES_SUBITEMS_SORTED = [...CONFIGURACOES_SUBITEMS].sort(
  (a, b) => a.order - b.order,
);

const CONFIGURACOES_COLLAPSED_HREF =
  CONFIGURACOES_SUBITEMS_SORTED[0]?.href ?? "/configuracoes/perfis";

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
    order: 37,
    label: "Auditoria de horas",
    href: "/auditoria/horas-colaboradores",
    icon: Clock3,
  },
  {
    type: "link",
    order: 35,
    label: "Ver Projetos",
    href: "/projetos",
    icon: FolderKanban,
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
  {
    type: "group",
    order: 60,
    key: "configuracoes",
    label: "Configurações",
    icon: Shield,
    collapsedHref: CONFIGURACOES_COLLAPSED_HREF,
    subitems: CONFIGURACOES_SUBITEMS_SORTED.map((s) => ({
      label: s.label,
      href: s.href,
      exact: s.exact,
    })),
  },
];

const MAIN_NAV_SORTED = [...MAIN_NAV].sort((a, b) => a.order - b.order);

function partitionNavEntries(entries: MainNavEntry[]) {
  const standalone: MainNavEntry[] = [];
  const gerenciar: MainNavEntry[] = [];
  const recursos: MainNavEntry[] = [];

  for (const entry of entries) {
    if (STANDALONE_NAV_ORDERS.has(entry.order)) {
      standalone.push(entry);
    } else if (GERENCIAR_NAV_ORDERS.has(entry.order)) {
      gerenciar.push(entry);
    } else if (RECURSOS_NAV_ORDERS.has(entry.order)) {
      recursos.push(entry);
    }
  }

  return { standalone, gerenciar, recursos };
}

export function AppSidebar({
  isCollapsed,
  isMobileOpen,
  isMobile,
}: AppSidebarProps) {
  const pathname = usePathname();
  const rbacReady = permissionsLoaded();
  const canListAcquirer = !rbacReady || hasPermission("list-acquirer");
  const canListCase =
    rbacReady && hasAnyPermission(["list-case", "list-report"]);
  const canListProject = rbacReady && hasPermission("list-project");
  const canAssignUserRole = rbacReady && hasPermission("assign-user-role");
  const canListUser = rbacReady && hasPermission("list-user");
  const configuracoesSubitemsSorted = CONFIGURACOES_SUBITEMS_SORTED.filter(
    (item) => {
      if (item.href === "/configuracoes/perfis") return canAssignUserRole;
      if (item.href === "/configuracoes/usuarios") return canListUser;
      return true;
    },
  );
  const canSeeConfiguracoes = configuracoesSubitemsSorted.length > 0;
  const mainNavSorted = MAIN_NAV_SORTED.filter((entry) => {
    if (entry.type === "group" && entry.key === "configuracoes") {
      return canSeeConfiguracoes;
    }

    if (rbacReady && !canListCase && entry.type === "link") {
      return entry.href !== "/casos";
    }

    if (rbacReady && !canListProject && entry.type === "link") {
      return entry.href !== "/projetos";
    }

    if (!canListAcquirer && entry.type === "link") {
      return entry.href !== "/cadastros/adquirentes/status";
    }

    return true;
  });

  const { standalone, gerenciar, recursos } = useMemo(
    () => partitionNavEntries(mainNavSorted),
    [mainNavSorted],
  );

  const cadastrosSubitemsSorted = canListAcquirer
    ? CADASTROS_SUBITEMS_SORTED
    : [];
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
          <Icon className="h-3.5 w-3.5 shrink-0" />
          {!isCollapsed && <span>{item.label}</span>}
        </SidebarNavItem>
      </Link>
    );
  }

  function renderNavEntry(entry: MainNavEntry) {
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

    const open = entry.key === "cadastros" ? cadastrosOpen : configuracoesOpen;
    const onOpenChange =
      entry.key === "cadastros" ? setCadastrosOpen : setConfiguracoesOpen;
    const subitems =
      entry.key === "cadastros"
        ? cadastrosSubitemsSorted.map((s) => ({
            label: s.label,
            href: s.href,
            exact: s.exact,
          }))
        : configuracoesSubitemsSorted.map((s) => ({
            label: s.label,
            href: s.href,
            exact: s.exact,
          }));
    const collapsedHref =
      entry.key === "configuracoes"
        ? (configuracoesSubitemsSorted[0]?.href ?? entry.collapsedHref)
        : entry.collapsedHref;

    return (
      <span key={entry.key} className="contents">
        <SidebarCollapsibleGroup
          isCollapsed={isCollapsed}
          pathname={pathname}
          open={open}
          onOpenChange={onOpenChange}
          collapsedHref={collapsedHref}
          label={entry.label}
          icon={entry.icon}
          subitems={subitems}
          titleWhenCollapsed={
            entry.key === "cadastros" ? "Cadastros" : "Configurações"
          }
        />
      </span>
    );
  }

  return (
    <Sidebar
      isCollapsed={isCollapsed}
      isMobileOpen={isMobileOpen}
      isMobile={isMobile}
      className="dark:bg-background"
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

      <SidebarContent className="px-4 py-2">
        <SidebarNav className={cn("gap-0 p-0", isCollapsed && "items-center")}>
          {standalone.map(renderNavEntry)}

          {gerenciar.length > 0 && (
            <>
              {!isCollapsed && (
                <SidebarSectionLabel>GERENCIAR</SidebarSectionLabel>
              )}
              {gerenciar.map(renderNavEntry)}
            </>
          )}

          {recursos.length > 0 && (
            <>
              {!isCollapsed && (
                <SidebarSectionLabel>RECURSOS ESTRATÉGICOS</SidebarSectionLabel>
              )}
              {recursos.map(renderNavEntry)}
            </>
          )}
        </SidebarNav>
      </SidebarContent>
    </Sidebar>
  );
}
