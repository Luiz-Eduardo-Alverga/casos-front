"use client";

import { useState, useEffect, useMemo } from "react";
import { FolderKanban } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/caso-form/provider";
import { useFormContext } from "react-hook-form";
import { useProjetos } from "@/hooks/use-projetos";
import { useProdutos } from "@/hooks/use-produtos";
import type { Projeto } from "@/services/auxiliar/projetos";

interface CasoFormProjetoProps {
  /**
   * Quando true (padrão), o campo só habilita e busca projetos após selecionar um produto
   * (para descobrir o `setor_projeto`).
   *
   * Quando false, o campo pode buscar/listar projetos mesmo sem produto.
   */
  requireProduto?: boolean;
  /** Nome do campo no react-hook-form. Padrão: `projeto` (tela de caso). */
  name?: "projeto" | "projeto_id";
  /** Se true, marca como obrigatório no UI (padrão: true). */
  required?: boolean;
}

export function CasoFormProjeto({
  requireProduto = true,
  name = "projeto",
  required = true,
}: CasoFormProjetoProps) {
  const { produto, isDisabled, lazyLoadComboboxOptions, editCaseItem } =
    useCasoForm();
  const { watch, setValue, getValues } = useFormContext();
  const produtoValue = watch("produto");
  const projetoValue = watch(name);
  const [optionsRequested, setOptionsRequested] = useState(
    !lazyLoadComboboxOptions,
  );

  const produtoAtual = produtoValue || produto;
  const setorFromEdit = editCaseItem?.projeto?.setores?.setor_projeto;

  const { data: produtos } = useProdutos({
    enabled: optionsRequested,
  });
  const produtoSelecionado = useMemo(() => {
    if (!produtoAtual || !produtos || !Array.isArray(produtos)) return null;
    return produtos.find((p) => String(p.id) === produtoAtual) || null;
  }, [produtoAtual, produtos]);

  const setorProjeto = produtoSelecionado?.setor ?? setorFromEdit;

  const { data: projetos, isLoading: isProjetosLoading } = useProjetos({
    setor_projeto: requireProduto ? setorProjeto : undefined,
    requireSetorProjeto: requireProduto,
    enabled: optionsRequested && (requireProduto ? !!setorProjeto : true),
  });

  const projetosOptions = useMemo(() => {
    const list: Array<{ value: string; label: string }> = [];
    if (
      lazyLoadComboboxOptions &&
      editCaseItem?.projeto &&
      projetoValue &&
      !projetos?.length
    ) {
      const p = editCaseItem.projeto;
      list.push({ value: String(p.id), label: p.descricao });
      return list;
    }
    if (!projetos || !Array.isArray(projetos)) return list;

    // Data atual
    const hoje = new Date();
    const primeiroDiaMesAtual = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      1,
    );

    // Filtrar projetos: apenas do mês atual e próximos meses
    // Um projeto é válido se data_final >= primeiro dia do mês atual
    const projetosFiltrados = projetos.filter((p: Projeto) => {
      if (!p.data_final) return false;
      const dataFinal = new Date(p.data_final);
      return dataFinal >= primeiroDiaMesAtual;
    });

    const options = projetosFiltrados.map((p) => ({
      value: String(p.id),
      label: p.id + " | " + p.nome_projeto,
    }));
    if (
      lazyLoadComboboxOptions &&
      editCaseItem?.projeto &&
      projetoValue &&
      !options.some((o) => o.value === projetoValue)
    ) {
      options.unshift({
        value: String(editCaseItem.projeto.id),
        label: editCaseItem.projeto.descricao,
      });
    }
    return options;
  }, [projetos, lazyLoadComboboxOptions, editCaseItem, projetoValue]);

  // Encontrar projeto do mês atual e definir como padrão (apenas quando produto está selecionado)
  useEffect(() => {
    if (
      requireProduto &&
      name === "projeto" &&
      produtoAtual &&
      produtoSelecionado &&
      projetos &&
      Array.isArray(projetos) &&
      projetosOptions.length > 0
    ) {
      const projetoAtualValue = getValues("projeto");
      // Só definir se ainda não houver projeto selecionado
      if (!projetoAtualValue || projetoAtualValue === "") {
        const hoje = new Date();
        const primeiroDiaMesAtual = new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          1,
        );
        const ultimoDiaMesAtual = new Date(
          hoje.getFullYear(),
          hoje.getMonth() + 1,
          0,
        );

        // Encontrar projeto que está no mês atual
        const projetoMesAtual = projetos.find((p: Projeto) => {
          if (!p.data_inicial || !p.data_final) return false;
          const dataInicial = new Date(p.data_inicial);
          const dataFinal = new Date(p.data_final);
          // Projeto está no mês atual se data_inicial <= último dia do mês atual E data_final >= primeiro dia do mês atual
          return (
            dataInicial <= ultimoDiaMesAtual && dataFinal >= primeiroDiaMesAtual
          );
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
  }, [
    produtoAtual,
    produtoSelecionado,
    requireProduto,
    name,
    projetos,
    projetosOptions,
    setValue,
    getValues,
  ]);

  return (
    <div className="space-y-2">
      <ComboboxField
        name={name}
        label="Projeto"
        icon={FolderKanban}
        options={projetosOptions}
        placeholder={
          requireProduto
            ? produtoAtual
              ? "Selecione o projeto..."
              : "Selecione o produto primeiro."
            : "Selecione o projeto..."
        }
        emptyText={
          isProjetosLoading
            ? "Carregando projetos..."
            : "Nenhum projeto encontrado."
        }
        // onSearchChange={setProjetosSearch}
        searchDebounceMs={450}
        disabled={
          isDisabled ||
          (requireProduto &&
            (!produtoAtual || (!produtoSelecionado && !setorFromEdit)))
        }
        required={required}
        onOpenChange={
          lazyLoadComboboxOptions
            ? (open) => open && setOptionsRequested(true)
            : undefined
        }
      />
    </div>
  );
}
