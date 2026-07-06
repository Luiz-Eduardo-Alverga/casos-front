"use client";

import { cn } from "@/lib/utils";
import {
  formatOcorrenciaTipoLabel,
  getOcorrenciaTipoDotClass,
  type OcorrenciaTipo,
} from "../ocorrencia-tipo-utils";

interface OcorrenciaStatusIndicatorProps {
  urgente: boolean;
  is: boolean;
  className?: string;
}

export function OcorrenciaStatusIndicator({
  urgente,
  is,
  className,
}: OcorrenciaStatusIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 px-1", className)}>
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          getOcorrenciaTipoDotClass(urgente, is),
        )}
        aria-hidden
      />
      <span className="text-sm font-semibold text-text-primary">
        {formatOcorrenciaTipoLabel(urgente, is)}
      </span>
    </div>
  );
}

interface OcorrenciaTipoIndicatorProps {
  tipo: OcorrenciaTipo;
  className?: string;
}

const TIPO_FLAGS: Record<
  OcorrenciaTipo,
  { urgente: boolean; is: boolean }
> = {
  "atendimento-imediato": { urgente: false, is: true },
  urgente: { urgente: true, is: false },
  padrao: { urgente: false, is: false },
};

export function OcorrenciaTipoIndicator({
  tipo,
  className,
}: OcorrenciaTipoIndicatorProps) {
  const flags = TIPO_FLAGS[tipo];
  return (
    <OcorrenciaStatusIndicator
      urgente={flags.urgente}
      is={flags.is}
      className={className}
    />
  );
}
