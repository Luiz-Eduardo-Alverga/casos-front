"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { EmptyState } from "@/components/painel/empty-state";
import { useSidebar } from "@/components/sidebar/sidebar-provider";
import { getUser } from "@/lib/auth";

import { MinhaVisaoFiltros } from "@/components/minha-visão/minha-visao-filtros";
import { MinhaVisaoKpis } from "@/components/minha-visão/minha-visao-kpis";
import { MinhaVisaoKpisSkeleton } from "@/components/minha-visão/minha-visao-kpis-skeleton";
import {
  CasosParaTestar,
  type CasosParaTestarView,
} from "@/components/minha-visão/casos-para-testar";
import { CasosEmProducao } from "@/components/minha-visão/casos-em-producao";
import { PrazosClientes } from "@/components/minha-visão/prazos-clientes";
import {
  Liberacoes,
  type TipoLiberacaoFiltro,
} from "@/components/minha-visão/liberacoes";
import { PainelIdeias } from "@/components/minha-visão/painel-ideias";
import { sumVisaoGeralPendente } from "@/components/minha-visão/utils";

import { useVisaoGeral } from "@/hooks/painel/use-visao-geral";
import { useVisaoCasosEmProducao } from "@/hooks/painel/use-visao-casos-em-producao";
import { useVisaoDistribuicao } from "@/hooks/painel/use-visao-distribuicao";
import { useVisaoPrazosClientes } from "@/hooks/painel/use-visao-prazos-clientes";
import { useVisaoProximasLiberacoes } from "@/hooks/painel/use-visao-proximas-liberacoes";
import { useVisaoUltimasLiberacoes } from "@/hooks/painel/use-visao-ultimas-liberacoes";
import { useVisaoPainelIdeias } from "@/hooks/painel/use-visao-painel-ideias";
import { useDebouncedValue } from "@/hooks/shared/use-debounced-value";
import type { VisaoGeralAgruparPor } from "@/services/sprint/get-visao-geral";
import { AUTO_REFETCH_INTERVAL_MS } from "@/lib/query-refetch-intervals";

const VERSAO_DEBOUNCE_MS = 300;

const VISAO_QUERY_KEYS = [
  "visao-geral",
  "visao-casos-em-producao",
  "visao-distribuicao",
  "visao-prazos-clientes",
  "visao-proximas-liberacoes",
  "visao-ultimas-liberacoes",
  "visao-painel-ideias",
] as const;

export function MinhaVisao() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { setCollapsed } = useSidebar();
  const [view, setView] = useState<CasosParaTestarView>("geral");
  const [agruparPor, setAgruparPor] =
    useState<VisaoGeralAgruparPor>("versao");
  const [atribuidoPara, setAtribuidoPara] = useState("");
  const [versao, setVersao] = useState("");
  const debouncedVersao = useDebouncedValue(versao, VERSAO_DEBOUNCE_MS);
  const [tipoLiberacao, setTipoLiberacao] =
    useState<TipoLiberacaoFiltro>("todos");

  // Colapsa a sidebar apenas enquanto o usuário está na tela Minha Visão.
  useEffect(() => {
    setCollapsed(true);
    return () => setCollapsed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtrosUrl = useMemo(
    () => ({
      setor: searchParams.get("setor") ?? "",
      produto_id: searchParams.get("produto_id") ?? "",
      id_projeto: searchParams.get("id_projeto") ?? "",
    }),
    [searchParams],
  );

  const temFiltroNaUrl = Boolean(
    filtrosUrl.setor || filtrosUrl.produto_id || filtrosUrl.id_projeto,
  );

  // Sem filtro na URL: usa o setor do usuário logado como padrão (quando existir).
  const setorPadraoUsuario = useMemo(() => {
    if (temFiltroNaUrl) return "";
    return getUser()?.setor ?? "";
  }, [temFiltroNaUrl]);

  const filtros = useMemo(
    () => ({
      setor: filtrosUrl.setor || setorPadraoUsuario,
      produto_id: filtrosUrl.produto_id,
      id_projeto: filtrosUrl.id_projeto,
    }),
    [filtrosUrl, setorPadraoUsuario],
  );

  const temFiltroAtivo = Boolean(
    filtros.setor || filtros.produto_id || filtros.id_projeto,
  );
  // Próximas/últimas liberações não aceitam id_projeto (apenas produto_id/setor).
  const temFiltroLiberacoes = Boolean(filtros.produto_id || filtros.setor);

  const autoRefetchOptions = {
    refetchInterval: temFiltroAtivo ? AUTO_REFETCH_INTERVAL_MS : false,
    refetchIntervalInBackground: true,
  } as const;

  const autoRefetchLiberacoesOptions = {
    refetchInterval: temFiltroLiberacoes ? AUTO_REFETCH_INTERVAL_MS : false,
    refetchIntervalInBackground: true,
  } as const;

  const visaoGeral = useVisaoGeral(
    {
      ...filtros,
      agrupar_por: agruparPor,
      ...(atribuidoPara ? { atribuido_para: atribuidoPara } : {}),
    },
    autoRefetchOptions,
  );
  const casosEmProducao = useVisaoCasosEmProducao(filtros, autoRefetchOptions);
  const distribuicao = useVisaoDistribuicao(
    {
      ...filtros,
      agrupar_por: agruparPor,
      ...(debouncedVersao.trim() ? { versao: debouncedVersao.trim() } : {}),
    },
    autoRefetchOptions,
  );
  const prazosClientes = useVisaoPrazosClientes(filtros, autoRefetchOptions);
  const proximasLiberacoes = useVisaoProximasLiberacoes(
    {
      produto_id: filtros.produto_id,
      setor: filtros.setor,
      ...(tipoLiberacao !== "todos" ? { tipo_liberacao: tipoLiberacao } : {}),
    },
    autoRefetchLiberacoesOptions,
  );
  const ultimasLiberacoes = useVisaoUltimasLiberacoes(
    {
      produto_id: filtros.produto_id,
      setor: filtros.setor,
      ...(tipoLiberacao !== "todos" ? { tipo_liberacao: tipoLiberacao } : {}),
      dias_liberacao: temFiltroLiberacoes ? "60" : undefined,
    },
    autoRefetchLiberacoesOptions,
  );
  const painelIdeias = useVisaoPainelIdeias(filtros, autoRefetchOptions);

  const handleAtualizar = useCallback(() => {
    VISAO_QUERY_KEYS.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  }, [queryClient]);

  const geralData = visaoGeral.data?.data ?? [];
  const distribuicaoData = distribuicao.data?.data ?? [];
  const distribuicaoTotais = distribuicao.data?.totais;
  const casosEmProducaoData = casosEmProducao.data?.data ?? [];
  const prazosClientesData = prazosClientes.data?.data ?? [];
  const proximasLiberacoesData = proximasLiberacoes.data?.data ?? [];
  const ultimasLiberacoesData = ultimasLiberacoes.data?.data ?? [];
  const painelIdeiasData = painelIdeias.data?.data ?? [];

  const kpisLoading =
    casosEmProducao.isLoading ||
    visaoGeral.isLoading ||
    distribuicao.isLoading ||
    prazosClientes.isLoading ||
    proximasLiberacoes.isLoading ||
    ultimasLiberacoes.isLoading;

  const casosParaTestarPendentes = sumVisaoGeralPendente(geralData);
  const casosParaTestarLoading =
    view === "geral" ? visaoGeral.isLoading : distribuicao.isLoading;

  return (
    <ListagemPageLayout
      title="Minha Visão"
      subtitle="Acompanhamento diário de prazos, liberações e carga de trabalho dos squads."
      actions={
        <MinhaVisaoFiltros
          filtrosIniciais={filtros}
          onAfterFiltrar={handleAtualizar}
        />
      }
    >
      {!temFiltroAtivo ? (
        <EmptyState
          title="Selecione um filtro"
          description="Escolha ao menos um setor, produto ou projeto para visualizar os dados da sua visão."
          className="py-16"
        />
      ) : (
        <>
          {kpisLoading ? (
            <MinhaVisaoKpisSkeleton />
          ) : (
            <MinhaVisaoKpis
              casosProducaoTotal={casosEmProducaoData.length}
              casosParaTestarPendentes={casosParaTestarPendentes}
              casosParaTestarSubtitulo={`${
                distribuicaoTotais?.estimados_horas ?? "00:00"
              } estimadas · ${distribuicaoData.length} devs ativos`}
              prazosClientesTotal={prazosClientesData.length}
              proximasLiberacoesTotal={proximasLiberacoesData.length}
              ultimasLiberacoesTotal={ultimasLiberacoesData.length}
            />
          )}

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex flex-col gap-4 w-full lg:flex-[2] min-w-0">
              <CasosParaTestar
                view={view}
                onViewChange={setView}
                agruparPor={agruparPor}
                onAgruparPorChange={setAgruparPor}
                atribuidoPara={atribuidoPara}
                onAtribuidoParaChange={setAtribuidoPara}
                versao={versao}
                onVersaoChange={setVersao}
                geralData={geralData}
                distribuicaoData={distribuicaoData}
                distribuicaoTotais={distribuicaoTotais}
                isLoading={casosParaTestarLoading}
              />
              <CasosEmProducao
                data={casosEmProducaoData}
                isLoading={casosEmProducao.isLoading}
              />
            </div>
            <div className="flex flex-col gap-4 w-full lg:w-[380px] shrink-0">
              <PrazosClientes
                data={prazosClientesData}
                isLoading={prazosClientes.isLoading}
              />
              <Liberacoes
                proximas={proximasLiberacoesData}
                concluidas={ultimasLiberacoesData}
                tipoLiberacao={tipoLiberacao}
                onTipoLiberacaoChange={setTipoLiberacao}
                isLoading={
                  proximasLiberacoes.isLoading || ultimasLiberacoes.isLoading
                }
              />
              <PainelIdeias
                data={painelIdeiasData}
                total={painelIdeias.data?.total ?? 0}
                isLoading={painelIdeias.isLoading}
              />
            </div>
          </div>
        </>
      )}
    </ListagemPageLayout>
  );
}
