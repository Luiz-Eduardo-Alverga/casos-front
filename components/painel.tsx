"use client";

import { ProdutosPriorizados } from "@/components/painel/produtos-priorizados";
import { CasosProduto } from "@/components/painel/casos-produto";
import { Retorno } from "@/components/painel/retorno";
import { useAgendaDev } from "@/hooks/use-agenda-dev";
import { getUser } from "@/lib/auth";
import { useState, useMemo, useEffect } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Plus, RefreshCcw } from "lucide-react";

export function Painel() {
  const user = getUser();
  const idColaborador = user?.id ? String(user.id) : "";
  const router = useRouter();
  const { data: agendaDevData, isLoading, refetch } = useAgendaDev({
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
      selecionado: item.selecionado === "1",
    }));
  }, [agendaDevData]);

  const casosDoProduto = [
    {
      id: "1",
      numero: "87062",
      versao: "7.0.0.0",
      descricao: "[Smart Comanda] Implementar fluxo de tratamento quando houver perda de conexão com o servidor",
      categoria: "Comanda",
      tempoEstimado: "06:00",
      tempoRealizado: "06:20",
      importancia: 4,
    },
    {
      id: "2",
      numero: "87062",
      versao: "7.0.0.0",
      descricao: "[Smart Comanda] Implementar fluxo de tratamento quando houver perda de conexão com o servidor",
      categoria: "Comanda",
      tempoEstimado: "06:00",
      tempoRealizado: "06:20",
      importancia: 4,
    },
    {
      id: "3",
      numero: "87063",
      versao: "7.0.1.0",
      descricao: "[Smart Comanda] Melhorar a interface do usuário para o histórico de pedidos",
      categoria: "Comanda",
      tempoEstimado: "08:00",
      tempoRealizado: "08:45",
      importancia: 5,
    },
    {
      id: "4",
      numero: "87064",
      versao: "7.0.2.0",
      descricao: "[Smart Comanda] Adicionar funcionalidade de pesquisa no menu de produtos",
      categoria: "Comanda",
      tempoEstimado: "09:00",
      tempoRealizado: "09:30",
      importancia: 6,
    },
  ];

  const retornos = [
    {
      id: "1",
      importancia: 3,
      produto: "Smart (Softcom Smart)",
      versao: "7.0.0.0",
      numero: "87062",
      descricao: "[Smart Comanda] Cancelamento de mesa",
    },
    {
      id: "2",
      importancia: 3,
      produto: "Smart (Softcom Smart)",
      versao: "7.0.0.0",
      numero: "87062",
      descricao: "[Smart Comanda] Cancelamento de mesa",
    },
    {
      id: "3",
      importancia: 3,
      produto: "Smart (Softcom Smart)",
      versao: "7.0.0.0",
      numero: "87062",
      descricao: "[Smart Comanda] Cancelamento de mesa",
    },
    {
      id: "4",
      importancia: 3,
      produto: "Smart (Softcom Smart)",
      versao: "7.0.0.0",
      numero: "87062",
      descricao: "[Smart Comanda] Cancelamento de mesa",
    },
    {
      id: "5",
      importancia: 3,
      produto: "Smart (Softcom Smart)",
      versao: "7.0.0.0",
      numero: "87062",
      descricao: "[Smart Comanda] Cancelamento de mesa",
    },
    {
      id: "6",
      importancia: 3,
      produto: "Smart (Softcom Smart)",
      versao: "7.0.0.0",
      numero: "87062",
      descricao: "[Smart Comanda] Cancelamento de mesa",
    },
  ];

  const [produtosState, setProdutosState] = useState(produtos);

  // Atualizar estado quando os dados da API mudarem
  useEffect(() => {
    setProdutosState(produtos);
  }, [produtos]);

  const selectedProduto = produtosState.find((p) => p.selecionado);
  const produtoNome = selectedProduto?.produto || "";

  const handleProdutoSelect = (id: string, selected: boolean) => {
    setProdutosState((prev) =>
      prev.map((p) => ({
        ...p,
        selecionado: p.id === id ? selected : selected ? false : p.selecionado,
      }))
    );
  };

  if (isLoading) {
    return (
      <div className="px-6 pt-20 py-10 flex-1 overflow-auto">
        <div className="flex items-center justify-center h-64">
          <p className="text-text-secondary">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-20 py-10 flex-1 overflow-auto">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-text-primary">Painel do Desenvolvedor</h1>
            <p className="text-sm text-text-secondary">Gerencie os produtos priorizados e visualize seus casos</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">

            <Button
              variant="outline"
              onClick={() => {
                refetch();
              }}
              type="button"                
              className="w-full sm:w-auto h-[42px] px-4 flex-1 sm:flex-initial "
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Atualizar
            </Button>

            <Button
              onClick={() => {
                router.push("/casos/novo");
              }}
              type="button"                
              className="w-full sm:w-auto h-[42px] px-4 flex-1 sm:flex-initial"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar Caso
            </Button>      
            
          </div>
        </div>

      {/* Content Grid */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-6 w-[732px]">
          {/* Produtos Priorizados */}
          <ProdutosPriorizados
            produtos={produtosState}
            onProdutoSelect={handleProdutoSelect}
          />

          {/* Retorno */}
          <Retorno retornos={retornos} />
        </div>

        {/* Right Column */}
        <div className="flex-1">
          <CasosProduto casos={casosDoProduto} produtoNome={produtoNome} />
        </div>
      </div>
    </div>
  );
}
