"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { AvisosLista } from "./avisos-lista";
import { AvisosDetalhe } from "./avisos-detalhe";
import {
  getPeriodoRange,
  PERIODO_AVISOS_OPCOES,
  type PeriodoAvisosValue,
} from "@/lib/periodo-avisos";

export function Avisos() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idFromUrl = searchParams.get("id");

  const [idSelecionado, setIdSelecionado] = useState<number | string | null>(
    () => (idFromUrl ? idFromUrl : null),
  );
  const [periodo, setPeriodo] = useState<PeriodoAvisosValue>("este_mes");

  const periodoRange = useMemo(() => getPeriodoRange(periodo), [periodo]);

  useEffect(() => {
    if (idFromUrl) {
      setIdSelecionado(idFromUrl);
    }
  }, [idFromUrl]);

  const handleSelect = (id: number | string) => {
    setIdSelecionado(id);
    router.replace(`/avisos?id=${id}`, { scroll: false });
  };

  return (
    <ListagemPageLayout
      title="Avisos"
      subtitle="Visualize e gerencie seus avisos e notificações"
      className="lg:min-h-0 lg:overflow-hidden"
      actions={
        <Select
          value={periodo}
          onValueChange={(v) => setPeriodo(v as PeriodoAvisosValue)}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-9 bg-white">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            {PERIODO_AVISOS_OPCOES.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <div className="flex flex-col sm:flex-row gap-6 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <div className="flex flex-col w-full sm:w-[380px] lg:w-[400px] lg:min-h-0 lg:flex-shrink-0">
          <AvisosLista
            idSelecionado={idSelecionado}
            onSelect={handleSelect}
            periodo={periodoRange}
          />
        </div>
        <div className="flex flex-col flex-1 lg:min-h-0 lg:overflow-hidden">
          <AvisosDetalhe idSelecionado={idSelecionado} />
        </div>
      </div>
    </ListagemPageLayout>
  );
}
