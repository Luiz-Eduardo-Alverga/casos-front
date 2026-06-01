"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatMinutosHoraEMinutos } from "./utils";
import { ProducaoMetricaCard } from "./producao-metrica-card";

export interface ProducaoControleProps {
  naoPlanejadoFlag: boolean;
  estimadoMin: number;
  realizadoMin: number;
  desenvolvendoMin: number;
  testandoMin: number;
}

export function ProducaoControle({
  naoPlanejadoFlag,
  estimadoMin,
  realizadoMin,
  desenvolvendoMin,
  testandoMin,
}: ProducaoControleProps) {
  void Badge;
  return (
    <div className="bg-card rounded-lg border border-border-divider p-5 space-y-4 bg-sky-100">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-primary">
          Controle de Produção
        </h3>
        {naoPlanejadoFlag && (
          <div className="flex items-center gap-2">
            <Checkbox checked disabled className="pointer-events-none" />
            <span className="text-xs text-text-secondary">Não planejado</span>
          </div>
        )}
      </div>

      {naoPlanejadoFlag ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ProducaoMetricaCard
            label={
              realizadoMin < 60
                ? "Total minutos produção"
                : "Total horas produção"
            }
            value={formatMinutosHoraEMinutos(realizadoMin)}
            valueVariant="sky"
          />
          <ProducaoMetricaCard
            label={
              desenvolvendoMin < 60
                ? "Total minutos desenvolvidos"
                : "Total horas desenvolvidas"
            }
            value={formatMinutosHoraEMinutos(desenvolvendoMin)}
            valueVariant="purple"
          />
          <ProducaoMetricaCard
            label={
              testandoMin < 60 ? "Total minutos de teste" : "Total horas teste"
            }
            value={formatMinutosHoraEMinutos(testandoMin)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <ProducaoMetricaCard
            label={
              estimadoMin < 60
                ? "Total minutos estimado"
                : "Total horas estimado"
            }
            value={formatMinutosHoraEMinutos(estimadoMin)}
          />
          <ProducaoMetricaCard
            label={
              realizadoMin < 60
                ? "Total Minutos desenvolvidos"
                : "Total horas desenvolvidas"
            }
            value={formatMinutosHoraEMinutos(desenvolvendoMin)}
            valueVariant="sky"
          />
          <ProducaoMetricaCard
            label={
              desenvolvendoMin > estimadoMin
                ? "Tempo excedido"
                : "Tempo dentro do estimado"
            }
            value={formatMinutosHoraEMinutos(
              Math.abs(desenvolvendoMin - estimadoMin),
            )}
            valueVariant={
              desenvolvendoMin > estimadoMin ? "destructive" : "default"
            }
          />
          <ProducaoMetricaCard
            label={
              testandoMin < 60 ? "Total minutos de teste" : "Total horas teste"
            }
            value={formatMinutosHoraEMinutos(testandoMin)}
            valueVariant="sky"
          />
          <ProducaoMetricaCard
            label="Tempo Produção"
            value={formatMinutosHoraEMinutos(realizadoMin)}
            valueVariant="sky"
          />
        </div>
      )}
    </div>
  );
}
