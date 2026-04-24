import {
  Boxes,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Mapa `moduleSlug` → ícone `lucide-react`. Fallback `Boxes` caso o slug
 * não esteja mapeado — evita depender do backend exportar nomes de ícones.
 */
const ICON_BY_SLUG: Record<string, LucideIcon> = {
  cadastros: Boxes,
  cadastro: Boxes,
  casos: FileText,
  dashboard: LayoutDashboard,
  financeiro: CircleDollarSign,
  relatorios: FileText,
  usuarios: Users,
  users: Users,
  "user-management": Users,
  rbac: Shield,
  permissoes: ShieldCheck,
  permissions: ShieldCheck,
  configuracoes: Settings,
  settings: Settings,
  ferramentas: Wrench,
  produtos: Package,
};

export function getModuleIcon(slug: string | null | undefined): LucideIcon {
  if (!slug) return Boxes;
  const key = slug.toLowerCase();
  return ICON_BY_SLUG[key] ?? Boxes;
}
