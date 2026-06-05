import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  AlignLeft,
  Building2,
  CalendarClock,
  ClipboardList,
  FileText,
  GitBranch,
  History,
  LayoutList,
  Package,
  Paperclip,
  StickyNote,
  Tags,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";

export type CardHeaderPreset = {
  icon: LucideIcon;
  iconClassName: string;
};

export const CARD_HEADER_PRESETS = {
  informacoes: { icon: FileText, iconClassName: "text-sky-600" },
  informacoesGerais: { icon: LayoutList, iconClassName: "text-sky-600" },
  detalhesReport: { icon: AlignLeft, iconClassName: "text-blue-600" },
  classificacaoOrigem: { icon: Tags, iconClassName: "text-violet-600" },
  dadosProduto: { icon: Package, iconClassName: "text-indigo-600" },
  atribuicao: { icon: Users, iconClassName: "text-orange-600" },
  responsaveis: { icon: UserCog, iconClassName: "text-orange-600" },
  dadosOcorrencia: { icon: AlertCircle, iconClassName: "text-sky-600" },
  infoDesenvolvimento: { icon: CalendarClock, iconClassName: "text-amber-600" },
  statusReport: { icon: ClipboardList, iconClassName: "text-violet-600" },
  anotacoes: { icon: StickyNote, iconClassName: "text-amber-600" },
  relacoes: { icon: GitBranch, iconClassName: "text-purple-600" },
  clientes: { icon: Building2, iconClassName: "text-violet-600" },
  anexos: { icon: Paperclip, iconClassName: "text-slate-600" },
  historico: { icon: History, iconClassName: "text-slate-600" },
  producao: { icon: Wrench, iconClassName: "text-green-600" },
} as const satisfies Record<string, CardHeaderPreset>;

export type CardHeaderPresetKey = keyof typeof CARD_HEADER_PRESETS;

export function getCardHeaderPreset(key: CardHeaderPresetKey): CardHeaderPreset {
  return CARD_HEADER_PRESETS[key];
}
