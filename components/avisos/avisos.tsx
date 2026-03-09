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
import { AvisosLista } from "./avisos-lista";
import { AvisosDetalhe } from "./avisos-detalhe";
import {
  getPeriodoRange,
  PERIODO_AVISOS_OPCOES,
  type PeriodoAvisosValue,
} from "@/lib/periodo-avisos";
import { Calendar } from "lucide-react";

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
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Avisos</h1>
          <p className="text-sm text-text-secondary">
            Visualize e gerencie seus avisos e notificações
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* <Calendar className="h-4 w-4 text-text-secondary shrink-0" /> */}
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
        </div>
      </div>

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
    </div>
  );
}
