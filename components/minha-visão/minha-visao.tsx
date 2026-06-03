"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { MinhaVisaoFiltros } from "@/components/minha-visão/minha-visao-filtros";
import { CasosParaTestar } from "@/components/minha-visão/casos-para-testar";
import { CasosParaTestarSkeleton } from "@/components/minha-visão/casos-para-testar-skeleton";
import { useAgendaDev } from "@/hooks/painel/use-agenda-dev";
import { getUser } from "@/lib/auth";

export function MinhaVisao() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = getUser();
  const idColaborador = user?.id ? String(user.id) : "";

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
    <ListagemPageLayout
      title="Painel Minha Visão"
      subtitle="Visualize os casos para testar"
      actions={
        <>
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
        </>
      }
    >
      <MinhaVisaoFiltros filtrosIniciais={filtros} />
      {isLoading ? (
        <CasosParaTestarSkeleton />
      ) : (
        <CasosParaTestar agendaData={filteredAgendaData ?? []} />
      )}
    </ListagemPageLayout>
  );
}
