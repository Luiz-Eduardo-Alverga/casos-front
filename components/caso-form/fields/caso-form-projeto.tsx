"use client";

import { useState, useEffect, useMemo } from "react";
import { FolderKanban } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "../provider";
import { useFormContext } from "react-hook-form";
import { useProjetos } from "@/hooks/use-projetos";
import { useProdutos } from "@/hooks/use-produtos";
import type { Projeto } from "@/services/auxiliar/projetos";

export function CasoFormProjeto() {
  const { produto, isDisabled } = useCasoForm();
  const { watch, setValue, getValues } = useFormContext();
  const produtoValue = watch("produto");
  // const [projetosSearch, setProjetosSearch] = useState<string>("");
  
  const produtoAtual = produtoValue || produto;
  
  // Buscar produto selecionado para obter o setor
  const { data: produtos } = useProdutos();
  const produtoSelecionado = useMemo(() => {
    if (!produtoAtual || !produtos || !Array.isArray(produtos)) return null;
    return produtos.find(p => String(p.id) === produtoAtual) || null;
  }, [produtoAtual, produtos]);
  
  const { data: projetos, isLoading: isProjetosLoading } = useProjetos({
    setor_projeto: produtoSelecionado?.setor,
    // search: projetosSearch.trim() || undefined,
  });
  
  const projetosOptions = useMemo(() => {
    if (!projetos || !Array.isArray(projetos)) return [];
    
    // Data atual
    const hoje = new Date();
    const primeiroDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    // Filtrar projetos: apenas do mês atual e próximos meses
    // Um projeto é válido se data_final >= primeiro dia do mês atual
    const projetosFiltrados = projetos.filter((p: Projeto) => {
      if (!p.data_final) return false;
      const dataFinal = new Date(p.data_final);
      return dataFinal >= primeiroDiaMesAtual;
    });
    
    return projetosFiltrados.map((p) => ({
      value: String(p.id),
      label: p.nome_projeto,
    }));
  }, [projetos]);
  
  // Encontrar projeto do mês atual e definir como padrão (apenas quando produto está selecionado)
  useEffect(() => {
    if (produtoAtual && produtoSelecionado && projetos && Array.isArray(projetos) && projetosOptions.length > 0) {
      const projetoAtualValue = getValues("projeto");
      // Só definir se ainda não houver projeto selecionado
      if (!projetoAtualValue || projetoAtualValue === "") {
        const hoje = new Date();
        const primeiroDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        
        // Encontrar projeto que está no mês atual
        const projetoMesAtual = projetos.find((p: Projeto) => {
          if (!p.data_inicial || !p.data_final) return false;
          const dataInicial = new Date(p.data_inicial);
          const dataFinal = new Date(p.data_final);
          // Projeto está no mês atual se data_inicial <= último dia do mês atual E data_final >= primeiro dia do mês atual
          return dataInicial <= ultimoDiaMesAtual && dataFinal >= primeiroDiaMesAtual;
        });
        
        if (projetoMesAtual) {
          setValue("projeto", String(projetoMesAtual.id));
        } else {
          // Se não encontrar projeto do mês atual, pegar o primeiro projeto válido (mais próximo)
          const primeiroProjeto = projetosOptions[0];
          if (primeiroProjeto) {
            setValue("projeto", primeiroProjeto.value);
          }
        }
      }
    }
  }, [produtoAtual, produtoSelecionado, projetos, projetosOptions, setValue, getValues]);
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name="projeto"
        label="Projeto"
        icon={FolderKanban}
        options={projetosOptions}
        placeholder={produtoAtual ? "Selecione o projeto..." : "Selecione o produto primeiro."}
        emptyText={isProjetosLoading ? "Carregando projetos..." : "Nenhum projeto encontrado."}
        // onSearchChange={setProjetosSearch}
        searchDebounceMs={450}
        disabled={isDisabled || !produtoAtual || !produtoSelecionado}
        required
      />
    </div>
  );
}
