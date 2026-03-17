"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { MinhaVisaoFiltros } from "@/components/minha-visão/minha-visao-filtros";
import { CasosParaTestar } from "@/components/minha-visão/casos-para-testar";
import { CasosParaTestarSkeleton } from "@/components/minha-visão/casos-para-testar-skeleton";
import { useAgendaDev } from "@/hooks/use-agenda-dev";
import { getUser } from "@/lib/auth";

export function MinhaVisao() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = getUser();
  const idColaborador = user?.id ? String(user.id) : "";

  // Ler filtros da URL (mesma lógica que em Casos)
  const filtros = useMemo(() => {
    const setor = searchParams.get("setor") || "";
    const produto = searchParams.get("produto") || "";
    return { setor, produto };
  }, [searchParams]);

  const handleLimparFiltros = useCallback(() => {
    router.push("/painel/minha-visao");
  }, [router]);

  const { data: agendaData, isLoading } = useAgendaDev({
    id_colaborador: idColaborador,
  });

  const filteredAgendaData = useMemo(() => {
    if (!agendaData) return [];
    let list = agendaData;
    if (filtros.produto?.trim()) {
      list = list.filter((a) => a.id_produto === filtros.produto.trim());
    }
    return list;
  }, [agendaData, filtros.produto]);

  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">
            Painel Minha Visão
          </h1>
          <p className="text-sm text-text-secondary">
            Visualize os casos para testar
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button
            variant="outline"
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            onClick={handleLimparFiltros}
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Limpar filtros
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/painel")}
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Button>
        </div>
      </div>

      <MinhaVisaoFiltros filtrosIniciais={filtros} />
      {isLoading ? (
        <CasosParaTestarSkeleton />
      ) : (
        <CasosParaTestar agendaData={filteredAgendaData ?? []} />
      )}
    </div>
  );
}
