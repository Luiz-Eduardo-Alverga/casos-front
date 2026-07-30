"use client";

import { cn } from "@/lib/utils";
import { getAvatarBgClass, getInitials } from "@/components/minha-visão/utils";
import type {
  VisaoDistribuicaoItem,
  VisaoDistribuicaoTotais,
} from "@/services/sprint/get-visao-distribuicao";
import type { VisaoGeralAgruparPor } from "@/services/sprint/get-visao-geral";

interface CasosParaTestarDistribuicaoTableProps {
  data: VisaoDistribuicaoItem[];
  totais?: VisaoDistribuicaoTotais;
  agruparPor: VisaoGeralAgruparPor;
}

interface MetricCellProps {
  value: number | string;
  label: string;
  highlight?: boolean;
}

function MetricCell({ value, label, highlight }: MetricCellProps) {
  return (
    <div>
      <div
        className={cn(
          "text-xs font-semibold",
          highlight ? "text-amber-600" : "text-text-primary",
        )}
      >
        {value}
      </div>
      <div className="text-[10px] text-text-secondary">{label}</div>
    </div>
  );
}

export function CasosParaTestarDistribuicaoTable({
  data,
  totais,
  agruparPor,
}: CasosParaTestarDistribuicaoTableProps) {
  const maxAbertos = Math.max(1, ...data.map((p) => p.abertos));

  return (
    <div className="flex flex-col">
      <div className="max-h-[420px] overflow-y-auto divide-y divide-border-divider">
        {data.map((p, idx) => {
          const busy = p.abertos / maxAbertos;
          const barClass =
            busy > 0.7
              ? "bg-red-500"
              : busy > 0.4
                ? "bg-amber-500"
                : "bg-blue-500";
          return (
            <div
              key={`${p.atribuido_para}-${idx}`}
              className="flex justify-between px-4 py-3 items-center gap-4"
            >
              <div className="flex items-center gap-2.5 w-[240px] shrink-0">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full grid place-items-center text-white font-semibold text-[11px] shrink-0",
                    getAvatarBgClass(p.atribuido_para),
                  )}
                >
                  {getInitials(p.atribuido_para)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-text-primary truncate">
                    {p.atribuido_para}
                  </span>
                  {agruparPor === "versao" && p.campo ? (
                    <span className="text-[10px] text-text-secondary">
                      {p.campo}
                    </span>
                  ) : null}
                </div>
              </div>
              {/* <div className="flex-1 min-w-[100px]">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", barClass)}
                    style={{ width: `${busy * 100}%` }}
                  />
                </div>
              </div> */}
              <div className="grid grid-cols-6 gap-3 text-right shrink-0 w-[500px]">
                <MetricCell value={p.retornos} label="Retornos" />
                <MetricCell value={p.pendentes_qtd} label="Abertos" />
                <MetricCell value={p.estimados_qtd} label="estimados" />
                <MetricCell value={p.estimados_horas} label="horas est." />
                <MetricCell
                  value={p.abertos}
                  label="Planejados"
                  highlight={p.abertos > 0}
                />
                <MetricCell
                  value={p.nao_planejados_qtd}
                  label="Não planejados"
                  highlight={p.nao_planejados_qtd > 0}
                />
              </div>
            </div>
          );
        })}
      </div>
      {totais ? (
        <div className="px-4 py-2.5 border-t border-border-divider bg-muted/30 flex items-center justify-between gap-4 text-xs text-text-secondary">
          <span className="w-[240px] shrink-0">Totais</span>
          <div className="grid grid-cols-6 gap-3 text-right shrink-0 w-[500px]">
            <span className="font-semibold text-text-primary">
              {totais.retornos}
            </span>
            <span className="font-semibold text-text-primary">
              {totais.pendentes_qtd}
            </span>
            <span className="font-semibold text-text-primary">
              {totais.estimados_qtd}
            </span>
            <span className="font-semibold text-text-primary">
              {totais.estimados_horas}
            </span>
            <span className="font-semibold text-text-primary">
              {totais.abertos}
            </span>
            <span className="font-semibold text-text-primary">
              {totais.nao_planejados_qtd}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
