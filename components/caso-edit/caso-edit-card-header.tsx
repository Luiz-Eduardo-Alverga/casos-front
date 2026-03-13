"use client";

import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

export interface CasoEditCardHeaderProps {
  /** Título exibido no header do card */
  title: string;
  /** Ícone exibido ao lado do título (ex: FileText, Users) */
  icon: LucideIcon;
  /** Valor opcional exibido como badge à direita (ex: casoId para "#123") */
  badge?: string | number;
  /** Se true, aplica shrink-0 no header (padrão para cards com conteúdo scrollável) */
  shrink?: boolean;
}

/**
 * Header padronizado para cards da edição de caso.
 * Segue PADRAO_COMPONENTES e PADRAO_ESPACAMENTOS (p-5 pb-2, border-b, gap-2).
 */
export function CasoEditCardHeader({
  title,
  icon: Icon,
  badge,
  shrink = true,
}: CasoEditCardHeaderProps) {
  return (
    <CardHeader
      className={`p-5 pb-2 border-b border-border-divider ${shrink ? "shrink-0" : ""}`}
    >
      <div className="flex w-full items-center gap-2">
        <Icon className="h-3.5 w-3.5 shrink-0 text-text-primary" />
        <CardTitle className="min-w-0 flex-1 text-sm font-semibold text-text-primary">
          {title}
        </CardTitle>
        {badge != null && badge !== "" && (
          <Badge
            variant="secondary"
            className="h-7 shrink-0 rounded-full border-transparent bg-sky-100 px-2.5 text-sm font-semibold text-text-primary hover:bg-sky-100/80"
          >
            #{badge}
          </Badge>
        )}
      </div>
    </CardHeader>
  );
}
