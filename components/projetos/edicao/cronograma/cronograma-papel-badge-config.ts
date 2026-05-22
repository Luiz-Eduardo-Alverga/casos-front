import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  ClipboardCheck,
  Code2,
  Palette,
  Tag,
} from "lucide-react";

export interface CronogramaPapelBadgeStyle {
  keys: string[];
  idPapeis?: number[];
  Icon: LucideIcon;
  containerClass: string;
  iconClass: string;
  paddingClass?: string;
}

export const CRONOGRAMA_PAPEL_BADGE_CONFIG: CronogramaPapelBadgeStyle[] = [
  {
    keys: ["PM"],
    Icon: Briefcase,
    containerClass: "bg-purple-100 text-purple-800",
    iconClass: "h-3 w-3.5 shrink-0",
    paddingClass: "px-2.5",
  },
  {
    keys: ["DEV", "DESENVOLVEDOR", "DESENVOLVIMENTO"],
    Icon: Code2,
    containerClass: "bg-emerald-100 text-emerald-800",
    iconClass: "h-3 w-[15px] shrink-0",
    paddingClass: "px-2",
  },
  {
    keys: ["QA"],
    Icon: ClipboardCheck,
    containerClass: "bg-sky-100 text-sky-800",
    iconClass: "h-3 w-3 shrink-0",
    paddingClass: "px-2",
  },
  {
    keys: ["UX"],
    Icon: Palette,
    containerClass: "bg-orange-100 text-orange-800",
    iconClass: "h-3 w-3 shrink-0",
    paddingClass: "px-2",
  },
  {
    keys: [],
    Icon: Tag,
    containerClass: "bg-muted text-text-secondary",
    iconClass: "h-3 w-3 shrink-0",
    paddingClass: "px-2.5",
  },
];

const FALLBACK_STYLE =
  CRONOGRAMA_PAPEL_BADGE_CONFIG[CRONOGRAMA_PAPEL_BADGE_CONFIG.length - 1];

function normalizePapelKey(label: string): string {
  return label.trim().toUpperCase();
}

export function resolveCronogramaPapelBadgeStyle(
  idPapel: number,
  papelLabel: string,
): CronogramaPapelBadgeStyle {
  const key = normalizePapelKey(papelLabel);

  for (const item of CRONOGRAMA_PAPEL_BADGE_CONFIG) {
    if (item.keys.length === 0) continue;
    if (item.keys.includes(key)) return item;
    if (item.idPapeis?.includes(idPapel)) return item;
  }

  return FALLBACK_STYLE;
}
