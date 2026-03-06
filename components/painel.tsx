"use client";

import { ProdutosPriorizados } from "@/components/painel/produtos-priorizados";
import { ProdutosPriorizadosSkeleton } from "@/components/painel/produtos-priorizados-skeleton";
import { CasosProduto } from "@/components/painel/casos-produto";
import { CasosProdutoSkeleton } from "@/components/painel/casos-produto-skeleton";
import { Retorno } from "@/components/painel/retorno";
import { RetornoSkeleton } from "@/components/painel/retorno-skeleton";
import { useAgendaDev } from "@/hooks/use-agenda-dev";
import { getUser, PAINEL_PRODUTO_ORDEM_KEY } from "@/lib/auth";
import { useState, useMemo, useEffect } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Plus, RefreshCcw, List } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function Painel() {
  const user = getUser();
  const idColaborador = user?.id ? String(user.id) : "";
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: agendaDevData, isLoading } = useAgendaDev({
    id_colaborador: idColaborador,
  });

  // Mapear dados da API para o formato esperado pelo componente
  const produtos = useMemo(() => {
    if (!agendaDevData) return [];

    return agendaDevData.map((item) => ({
      id: item.id_produto,
      ordem: item.ordem,
      produto: item.produto,
      versao: item.versao,
      abertos: parseInt(item.abertos, 10) || 0,
      corrigidos: parseInt(item.corrigidos, 10) || 0,
      retornos: parseInt(item.retornos, 10) || 0,
      selecionado: false,
    }));
  }, [agendaDevData]);

  const [produtosState, setProdutosState] = useState(produtos);

  // Atualizar estado quando os dados da API mudarem; seleção vem do localStorage (ou nenhuma)
  useEffect(() => {
    if (produtos.length === 0) return;
    const storedOrdem =
      typeof window !== "undefined"
        ? localStorage.getItem(PAINEL_PRODUTO_ORDEM_KEY)
        : null;
    const ordemValida =
      storedOrdem && produtos.some((p) => p.ordem === storedOrdem)
        ? storedOrdem
        : null;
    setProdutosState(
      produtos.map((p) => ({
        ...p,
        selecionado: ordemValida ? p.ordem === ordemValida : false,
      })),
    );
  }, [produtos]);

  const selectedProduto = produtosState.find((p) => p.selecionado);
  const produtoId =
    selectedProduto?.id != null ? String(selectedProduto.id) : "";
  const produtoNome = selectedProduto?.produto || "";
  const produtoVersao = selectedProduto?.versao || "";

  const handleProdutoSelect = (ordem: string, selected: boolean) => {
    if (typeof window !== "undefined") {
      if (selected) {
        localStorage.setItem(PAINEL_PRODUTO_ORDEM_KEY, ordem);
      } else {
        localStorage.removeItem(PAINEL_PRODUTO_ORDEM_KEY);
      }
    }
    setProdutosState((prev) =>
      prev.map((p) => ({
        ...p,
        selecionado:
          p.ordem === ordem ? selected : selected ? false : p.selecionado,
      })),
    );
  };

  if (isLoading) {
    return (
      <div className="px-6 pt-20 py-10 flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-text-primary">
              Painel do Desenvolvedor
            </h1>
            <p className="text-sm text-text-secondary">
              Gerencie os produtos priorizados e visualize seus casos
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              disabled
              className="w-full sm:w-auto h-[42px] px-4 flex-1 sm:flex-initial"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Atualizar
            </Button>
            <Button
              disabled
              className="w-full sm:w-auto h-[42px] px-4 flex-1 sm:flex-initial"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar Caso
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
          <div className="flex flex-col gap-6 w-full sm:w-[732px] lg:min-h-0 lg:flex-1 lg:overflow-hidden">
            <ProdutosPriorizadosSkeleton />
            <RetornoSkeleton />
          </div>
          <div className="flex flex-col lg:flex-1 lg:min-h-0 lg:overflow-hidden">
            <CasosProdutoSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">
            Painel do Desenvolvedor
          </h1>
          <p className="text-sm text-text-secondary">
            Gerencie os produtos priorizados e visualize seus casos
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => router.push("/casos")}
            type="button"
            className="w-full sm:w-auto h-[42px] px-4 flex-1 sm:flex-initial"
          >
            <List className="h-3.5 w-3.5" />
            Ver Casos
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["agenda-dev"] });
              queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
            }}
            type="button"
            className="w-full sm:w-auto h-[42px] px-4 flex-1 sm:flex-initial"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Content Grid - desktop: altura fixa; mobile: fluxo natural com scroll do navegador */}
      <div className="flex flex-col sm:flex-row gap-6 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        {/* Left Column */}
        <div className="flex flex-col gap-6 w-full sm:w-[732px] lg:min-h-0 lg:flex-1 lg:overflow-hidden">
          {/* Produtos Priorizados */}
          <ProdutosPriorizados
            produtos={produtosState}
            onProdutoSelect={handleProdutoSelect}
          />

          {/* Retorno */}
          <Retorno />
        </div>

        {/* Right Column */}
        <div className="flex flex-col lg:flex-1 lg:min-h-0 lg:overflow-hidden">
          <CasosProduto
            produtoId={produtoId}
            produtoNome={produtoNome}
            produtoVersao={produtoVersao}
          />
        </div>
      </div>
    </div>
  );
}
