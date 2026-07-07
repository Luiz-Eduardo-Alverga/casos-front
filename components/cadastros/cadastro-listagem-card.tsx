import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TotalRecordsUnit {
  singular: string;
  plural: string;
}

interface CadastroListagemCardProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  /** Exibe o total de registros no cabeçalho do card. */
  showTotalRecords?: boolean;
  /** Total retornado pela API (respeita filtros aplicados). */
  totalRecords?: number;
  /** Rótulo unitário do total (ex.: usuário/usuários). Padrão: registro/registros. */
  totalRecordsUnit?: TotalRecordsUnit;
}

const DEFAULT_TOTAL_RECORDS_UNIT: TotalRecordsUnit = {
  singular: "registro",
  plural: "registros",
};

function formatTotalRecords(total: number, unit: TotalRecordsUnit): string {
  return `${total} ${total === 1 ? unit.singular : unit.plural}`;
}

/** Mesmo padrão visual do card de listagem em `components/casos/casos-tabela.tsx`. */
export function CadastroListagemCard({
  title,
  icon: Icon,
  children,
  showTotalRecords = false,
  totalRecords,
  totalRecordsUnit = DEFAULT_TOTAL_RECORDS_UNIT,
}: CadastroListagemCardProps) {
  const shouldShowTotal = showTotalRecords && typeof totalRecords === "number";

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col flex-1 min-h-0">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              {title}
            </CardTitle>
          </div>

          {shouldShowTotal ? (
            <div className="text-sm font-semibold text-text-secondary">
              Total de {formatTotalRecords(totalRecords, totalRecordsUnit)}
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 overflow-x-auto flex-1 min-h-0">
        {children}
      </CardContent>
    </Card>
  );
}
