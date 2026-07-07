"use client";

import type { ReactNode } from "react";
import { CalendarDays, Clock, type LucideIcon } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { CasoAberturaInfo } from "@/lib/casos/caso-abertura-info";
import { useCasoEdit } from "./caso-edit-context";

export interface CasoEditCardHeaderProps {
  /** Título exibido no header do card */
  title: string;
  /** Ícone exibido ao lado do título (ex: FileText, Users) */
  icon: LucideIcon;
  /** Classe de cor do ícone (ex.: text-sky-600). Padrão: text-text-primary */
  iconClassName?: string;
  /** Valor opcional exibido como badge à direita (ex: casoId para "#123") */
  badge?: string | number;
  /** Metadados de abertura do caso (usuário, data e dias no backlog). */
  aberturaInfo?: CasoAberturaInfo;
  /** Conteúdo extra à direita do título (ex.: badge modo rápido na criação) */
  trailing?: ReactNode;
  /** Se true, aplica shrink-0 no header (padrão para cards com conteúdo scrollável) */
  shrink?: boolean;
}

function iniciaisUsuario(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
  return nome.slice(0, 2).toUpperCase() || "?";
}

function MetaDivider() {
  return (
    <span
      className="hidden h-4 w-px shrink-0 bg-sky-200/80 dark:bg-sky-800/60 sm:block"
      aria-hidden
    />
  );
}

function CasoAberturaMetaRow({ info }: { info: CasoAberturaInfo }) {
  const usuarioLabel = info.usuario !== "—" ? info.usuario : "Não informado";

  return (
    <div
      className={cn(
        "flex  flex-wrap items-center justify-between gap-x-3 gap-y-1.5",
        "rounded-lg border border-sky-100 bg-sky-50/70 px-3 py-1.5",
        "dark:border-sky-900/50 dark:bg-sky-950/25",
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
          <span>
            Aberto em:{" "}
            <span className="font-semibold text-text-primary">{info.data}</span>{" "}
            por {usuarioLabel}
          </span>
        </div>

        <MetaDivider />
      </div>

      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-full border border-sky-200 bg-card px-2 py-0.5",
          "text-[11px] font-semibold text-text-primary shadow-sm",
          "dark:border-sky-800 dark:bg-card/90",
        )}
        title={`${info.diasNoBacklog} dias no backlog`}
      >
        <Clock className="h-3 w-3 shrink-0 text-sky-600 dark:text-sky-400" />
        Aberto há {info.diasNoBacklog} dias
      </span>
    </div>
  );
}

/**
 * Header padronizado para cards da edição de caso.
 * Segue PADRAO_COMPONENTES e PADRAO_ESPACAMENTOS (p-4 pb-2, border-b, gap-2).
 */
export function CasoEditCardHeader({
  title,
  icon: Icon,
  iconClassName = "text-text-primary",
  badge,
  aberturaInfo,
  trailing,
  shrink = true,
}: CasoEditCardHeaderProps) {
  return (
    <CardHeader
      className={cn(
        "border-b border-border-divider p-4 pb-2",
        shrink && "shrink-0",
      )}
    >
      <div className="flex w-full justify-between items-center ">
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <Icon className={cn("h-3.5 w-3.5 shrink-0", iconClassName)} />
          <CardTitle className="min-w-0 text-sm font-semibold text-text-primary">
            {title}
          </CardTitle>
        </div>

        {aberturaInfo && <CasoAberturaMetaRow info={aberturaInfo} />}

        <div className="flex shrink-0 items-center gap-2">
          {badge != null && badge !== "" && (
            <Badge
              variant="secondary"
              className="h-7 shrink-0 border border-sky-100 dark:border-sky-900/50 rounded-full  bg-sky-50/70  hover:bg-sky-50/70 dark:hover:bg-sky-950/50  px-2.5 text-sm font-semibold text-text-primary dark:bg-sky-950/25"
            >
              #{badge}
            </Badge>
          )}
          {trailing}
        </div>
      </div>
    </CardHeader>
  );
}

/** Header de aba da edição de caso com badge e metadados de abertura automáticos. */
export function CasoEditTabCardHeader(
  props: Omit<CasoEditCardHeaderProps, "badge" | "aberturaInfo">,
) {
  const { numeroCaso, aberturaInfo } = useCasoEdit();

  return (
    <CasoEditCardHeader
      {...props}
      badge={numeroCaso}
      aberturaInfo={aberturaInfo}
    />
  );
}
