"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/painel/empty-state";
import { CasosEmProducaoSkeleton } from "./casos-em-producao-skeleton";
import { CasosEmProducaoRow } from "./casos-em-producao-row";
import type { VisaoCasosEmProducaoItem } from "@/services/sprint/get-visao-casos-em-producao";

interface CasosEmProducaoProps {
  data: VisaoCasosEmProducaoItem[];
  isLoading?: boolean;
}

export function CasosEmProducao({ data, isLoading = false }: CasosEmProducaoProps) {
  const [busca, setBusca] = useState("");

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return data;
    return data.filter((item) =>
      `${item.id_caso} ${item.colaborador} ${item.descricao_resumo}`
        .toLowerCase()
        .includes(termo),
    );
  }, [data, busca]);

  if (isLoading) {
    return <CasosEmProducaoSkeleton />;
  }

  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="p-4 pb-2 border-b border-border-divider flex-row items-center justify-between gap-3 space-y-0 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />

          <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            Casos em produção
            <span className="text-[11px] font-normal text-text-secondary">(live feed)</span>
          </CardTitle>


        </div>
        <div className="relative w-full sm:w-[260px]">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por caso, dev ou resumo…"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {itensFiltrados.length === 0 ? (
          <EmptyState
            title="Nenhum caso encontrado"
            description="Não há casos em produção no momento com os filtros selecionados."
            className="py-8"
          />
        ) : (
          <div className="max-h-[440px] overflow-y-auto">
            {itensFiltrados.map((item, idx) => (
              <CasosEmProducaoRow key={`${item.id_caso}-${idx}`} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { CasosEmProducaoSkeleton } from "./casos-em-producao-skeleton";
