import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { AuditStatusKey } from "./types";

export const JANELA_INICIO_PADRAO = "07:00";
export const JANELA_FIM_PADRAO = "17:00";

export function getTodayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function dateToYmdString(date: Date | undefined): string | undefined {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeAuditStatus(status: string): AuditStatusKey {
  const normalized = status.trim().toUpperCase().replace(/\s+/g, "_");

  if (normalized === "ALERTA_LEVE" || normalized === "ALERTA LEVE") {
    return "ALERTA_LEVE";
  }
  if (normalized === "ALERTA_CRITICO" || normalized === "ALERTA CRITICO") {
    return "ALERTA_CRITICO";
  }
  if (normalized === "INCONSISTENCIA" || normalized === "INCONSISTÊNCIA") {
    return "INCONSISTENCIA";
  }

  return "CONFORME";
}

export interface AuditStatusConfig {
  label: string;
  description: string;
  textClass: string;
  bgClass: string;
  progressTrackClass: string;
  progressIndicatorClass: string;
  badgeClass: string;
  icon: LucideIcon;
}

export const AUDIT_STATUS_CONFIG: Record<AuditStatusKey, AuditStatusConfig> = {
  CONFORME: {
    label: "Conforme",
    description: "Produção na média, sem choque de horários!",
    textClass: "text-audit-conforme",
    bgClass: "bg-audit-conforme-bg",
    progressTrackClass: "bg-audit-conforme-bg",
    progressIndicatorClass: "bg-audit-conforme",
    badgeClass:
      "bg-audit-conforme-bg text-audit-conforme border-transparent hover:bg-text-audit-conforme-bg/80",
    icon: CheckCircle2,
  },
  ALERTA_LEVE: {
    label: "Alerta Leve",
    description: "Atraso na entrada/almoço, ou pequenas janelas vazias.",
    textClass: "text-audit-alerta-leve",
    bgClass: "bg-audit-alerta-leve-bg",
    progressTrackClass: "bg-audit-alerta-leve-bg",
    progressIndicatorClass: "bg-audit-alerta-leve",
    badgeClass:
      "bg-audit-alerta-leve-bg text-audit-alerta-leve border-transparent hover:bg-text-audit-alerta-leve/80",
    icon: AlertTriangle,
  },
  ALERTA_CRITICO: {
    label: "Alerta Crítico",
    description: "Carga horária baixa ou janelas longas sem nenhum registro.",
    textClass: "text-audit-alerta-critico",
    bgClass: "bg-audit-alerta-critico-bg",
    progressTrackClass: "bg-audit-alerta-critico-bg",
    progressIndicatorClass: "bg-audit-alerta-critico",
    badgeClass:
      "bg-audit-alerta-critico-bg text-audit-alerta-critico border-transparent hover:bg-text-audit-alerta-critico/80",
    icon: AlertTriangle,
  },
  INCONSISTENCIA: {
    label: "Inconsistência",
    description:
      "Marcações duplicadas ou produção estendida de um dia para o outro.",
    textClass: "text-audit-inconsistencia",
    bgClass: "bg-audit-inconsistencia-bg",
    progressTrackClass: "bg-audit-inconsistencia-bg",
    progressIndicatorClass: "bg-audit-inconsistencia",
    badgeClass:
      "bg-audit-inconsistencia-bg text-audit-inconsistencia border-transparent hover:bg-text-audit-inconsistencia-bg/80",
    icon: XCircle,
  },
};

export function getAuditStatusConfig(status: string): AuditStatusConfig {
  return AUDIT_STATUS_CONFIG[normalizeAuditStatus(status)];
}

export const AUDIT_SUMMARY_ITEMS: Array<{
  key: keyof typeof AUDIT_STATUS_CONFIG;
  resumoKey: "conforme" | "alerta_leve" | "alerta_critico" | "inconsistencia";
}> = [
  { key: "CONFORME", resumoKey: "conforme" },
  { key: "ALERTA_LEVE", resumoKey: "alerta_leve" },
  { key: "ALERTA_CRITICO", resumoKey: "alerta_critico" },
  { key: "INCONSISTENCIA", resumoKey: "inconsistencia" },
];
