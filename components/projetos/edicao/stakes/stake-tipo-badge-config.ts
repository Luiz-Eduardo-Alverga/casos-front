import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  ClipboardCheck,
  Code2,
  ShieldCheck,
  Tag,
  Target,
} from "lucide-react";

/** Estilo visual de um badge de tipo de stake (Figma SoftFlow). */
export interface StakeTipoBadgeStyle {
  /**
   * Labels aceitos (`Nomes` da API), comparados em maiúsculas.
   * Use `[]` apenas no item fallback (último da lista).
   */
  keys: string[];
  /** IDs opcionais de `id_tipo` quando o label da API variar. */
  idTipos?: number[];
  Icon: LucideIcon;
  containerClass: string;
  iconClass: string;
  /** Padding horizontal do pill (Figma: PM px-10, demais px-8). */
  paddingClass?: string;
}

/**
 * Ordem importa: primeiro match por `keys` ou `idTipos` vence.
 * Para novo tipo: adicione um item antes do fallback.
 */
export const STAKE_TIPO_BADGE_CONFIG: StakeTipoBadgeStyle[] = [
  {
    keys: ["PM"],
    Icon: Briefcase,
    containerClass: "bg-purple-100 text-purple-800",
    iconClass: "h-3 w-3.5 shrink-0",
    paddingClass: "px-2.5",
  },
  {
    keys: ["PO"],
    Icon: Target,
    containerClass: "bg-indigo-100 text-indigo-800",
    iconClass: "h-3 w-3 shrink-0",
    paddingClass: "px-2",
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
    containerClass: "bg-amber-100 text-amber-800",
    iconClass: "h-3 w-3 shrink-0",
    paddingClass: "px-2",
  },
  {
    keys: ["SQA"],
    Icon: ShieldCheck,
    containerClass: "bg-sky-100 text-sky-800",
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
  STAKE_TIPO_BADGE_CONFIG[STAKE_TIPO_BADGE_CONFIG.length - 1];

function normalizeStakeTipoKey(label: string): string {
  return label.trim().toUpperCase();
}

export function resolveStakeTipoBadgeStyle(
  idTipo: number,
  tipoLabel: string,
): StakeTipoBadgeStyle {
  const key = normalizeStakeTipoKey(tipoLabel);

  for (const item of STAKE_TIPO_BADGE_CONFIG) {
    if (item.keys.length === 0) continue;
    if (item.keys.includes(key)) return item;
    if (item.idTipos?.includes(idTipo)) return item;
  }

  return FALLBACK_STYLE;
}
