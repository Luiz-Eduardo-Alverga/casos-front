"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { FolderKanban } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useFormContext } from "react-hook-form";
import { useProjetos } from "@/hooks/catalogos/use-projetos";
import { useProdutos } from "@/hooks/catalogos/use-produtos";
import type { Projeto } from "@/services/auxiliar/projetos";

interface CasoFormProjetoProps {
  /**
   * Quando true (padrão), o campo só habilita e busca projetos após selecionar um produto
   * (para descobrir o `setor_projeto`).
   *
   * Quando false, o campo pode buscar/listar projetos mesmo sem produto.
   */
  requireProduto?: boolean;
  /**
   * Força o setor usado na busca de projetos (ignora produto).
   * Útil em telas que filtram projetos pelo setor do usuário selecionado.
   */
  setorProjeto?: string;
  /**
   * Se definido, lê o setor do react-hook-form (ex.: `devAtribuidoSetor`) para buscar projetos.
   * Só é usado quando `setorProjeto` não foi passado.
   */
  setorProjetoFieldName?: string;
  /**
   * Quando true, só busca projetos se houver `setorProjeto` resolvido.
   * Padrão: mesmo valor de `requireProduto` (comportamento antigo).
   */
  requireSetorProjeto?: boolean;
  /**
   * Usuário usado na busca de projetos. Quando não informado, o service mantém
   * o comportamento padrão de usar o usuário logado salvo no localStorage.
   */
  usuarioId?: string | number;
  /** Nome do campo no react-hook-form. Padrão: `projeto` (tela de caso). */
  name?: "projeto" | "projeto_id";
  /** Se true, marca como obrigatório no UI (padrão: true). */
  required?: boolean;
  /** Esconde o label externo do campo (uso em headers compactos). */
  hideLabel?: boolean;
  /** Classe opcional para o container do campo. */
  wrapperClassName?: string;
  /** Classe de altura aplicada ao combobox e ao botão de limpar. */
  controlHeightClassName?: string;
  /** Prefixo exibido apenas no gatilho quando há valor selecionado. */
  valueLabelPrefix?: string;
  /**
   * Controla se o campo deve auto-selecionar um projeto padrão ao carregar.
   * - `whenProduto` (padrão): só auto-seleciona quando houver produto/setor (tela de abertura de caso)
   * - `always`: auto-seleciona assim que houver opções (kanban)
   * - `never`: nunca auto-seleciona (sheet de filtros)
   */
  autoSelectProjeto?: "never" | "whenProduto" | "always";
  /**
   * Nome do campo (opcional) para expor um boolean de loading no react-hook-form.
   * Útil quando a tela precisa exibir skeleton até o projeto carregar/auto-definir.
   */
  loadingFieldName?: string;
  /**
   * Quando true, usa `projetosExternos` / `projetosLoadingExterno` em vez de `useProjetos` interno.
   * Evita requisição duplicada (ex.: Kanban resolve projeto no container pai).
   */
  useExternalProjetos?: boolean;
  /** Lista de projetos fornecida pelo container (com `useExternalProjetos`). */
  projetosExternos?: Projeto[];
  /** Loading da lista externa (com `useExternalProjetos`). */
  projetosLoadingExterno?: boolean;
  /** Não envia `setor_projeto` na API (filtro de setor só no cliente, se necessário). */
  omitSetorProjetoInRequest?: boolean;
}

export function CasoFormProjeto({
  requireProduto = true,
  setorProjeto,
  setorProjetoFieldName,
  requireSetorProjeto,
  usuarioId,
  name = "projeto",
  required = true,
  hideLabel = false,
  wrapperClassName,
  controlHeightClassName,
  valueLabelPrefix,
  autoSelectProjeto = "whenProduto",
  loadingFieldName,
  useExternalProjetos = false,
  projetosExternos,
  projetosLoadingExterno = false,
  omitSetorProjetoInRequest = false,
}: CasoFormProjetoProps) {
  const { produto, isDisabled, lazyLoadComboboxOptions, editCaseItem } =
    useCasoForm();
  const { watch, setValue, getValues } = useFormContext();
  const produtoValue = watch("produto");
  const projetoValue = watch(name);
  const setorFromForm = setorProjetoFieldName
    ? String(watch(setorProjetoFieldName) ?? "")
    : "";
  const [optionsRequested, setOptionsRequested] = useState(
    useExternalProjetos || !lazyLoadComboboxOptions,
  );

  // Em telas como o Kanban, queremos buscar opções automaticamente ao carregar.
  useEffect(() => {
    if (autoSelectProjeto !== "always") return;
    if (optionsRequested) return;
    setOptionsRequested(true);
  }, [autoSelectProjeto, optionsRequested]);

  const produtoAtual = produtoValue || produto;
  const setorFromEdit = editCaseItem?.projeto?.setores?.setor_projeto;

  const { data: produtos } = useProdutos({
    enabled: optionsRequested && requireProduto,
  });
  const produtoSelecionado = useMemo(() => {
    if (!produtoAtual || !produtos || !Array.isArray(produtos)) return null;
    return produtos.find((p) => String(p.id) === produtoAtual) || null;
  }, [produtoAtual, produtos]);

  const setorProjetoFromProduto = produtoSelecionado?.setor ?? setorFromEdit;
  const setorProjetoResolved =
    (setorProjeto?.trim() ? setorProjeto.trim() : undefined) ??
    (setorFromForm.trim() ? setorFromForm.trim() : undefined) ??
    (requireProduto ? setorProjetoFromProduto : undefined);
  const requireSetorProjetoResolved = requireSetorProjeto ?? requireProduto;
  const usuarioIdNumber = useMemo(() => {
    if (usuarioId == null || String(usuarioId).trim() === "") return undefined;
    const n = Number(String(usuarioId).trim());
    return Number.isFinite(n) ? n : undefined;
  }, [usuarioId]);

  const { data: projetosInternos, isLoading: isProjetosLoadingInterno } =
    useProjetos({
      usuario_id: usuarioIdNumber,
      setor_projeto: omitSetorProjetoInRequest
        ? undefined
        : setorProjetoResolved,
      requireSetorProjeto: requireSetorProjetoResolved,
      enabled:
        !useExternalProjetos &&
        optionsRequested &&
        (!requireSetorProjetoResolved || Boolean(setorProjetoResolved)),
    });

  const projetos = useExternalProjetos ? projetosExternos : projetosInternos;
  const isProjetosLoading = useExternalProjetos
    ? projetosLoadingExterno
    : isProjetosLoadingInterno;

  // Expõe um loading para o form quando solicitado (ex.: Kanban Skeleton).
  useEffect(() => {
    if (!loadingFieldName || useExternalProjetos) return;
    const next = Boolean(
      (autoSelectProjeto === "always" && !optionsRequested) ||
        isProjetosLoading,
    );
    const current = Boolean(getValues(loadingFieldName as any));
    if (current !== next) {
      setValue(loadingFieldName as any, next, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [
    autoSelectProjeto,
    getValues,
    isProjetosLoading,
    loadingFieldName,
    optionsRequested,
    setValue,
  ]);

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

    const projetoId = String(projetoValue ?? "").trim();
    if (projetoId && !options.some((o) => o.value === projetoId)) {
      const found = projetos.find((p) => String(p.id) === projetoId);
      if (found) {
        options.unshift({
          value: projetoId,
          label: `${found.id} | ${found.nome_projeto}`,
        });
      } else if (useExternalProjetos || lazyLoadComboboxOptions) {
        options.unshift({
          value: projetoId,
          label: projetoId,
        });
      }
    }

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
  }, [
    projetos,
    lazyLoadComboboxOptions,
    editCaseItem,
    projetoValue,
    useExternalProjetos,
  ]);

  const parseLocalDate = (value: string | null | undefined): Date | null => {
    if (!value?.trim()) return null;
    const s = value.trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    const [, y, mo, d] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d), 0, 0, 0, 0);
  };

  /** Após o usuário limpar o projeto, não volta a auto-selecionar até mudar o contexto (setor/produto). */
  const skipAutoSelectRef = useRef(false);
  const prevProjetoForSkipRef = useRef<string | undefined>(undefined);
  const prevAutoSelectResetKeyRef = useRef<string | null>(null);

  const autoSelectResetKey = useMemo(() => {
    if (autoSelectProjeto === "never") return "";
    if (autoSelectProjeto === "always") {
      return `${String(usuarioIdNumber ?? "")}|${String(setorProjetoResolved ?? "")}`;
    }
    return `${String(usuarioIdNumber ?? "")}|${String(produtoAtual ?? "")}|${String(setorProjetoResolved ?? "")}`;
  }, [autoSelectProjeto, setorProjetoResolved, produtoAtual, usuarioIdNumber]);

  useEffect(() => {
    if (autoSelectProjeto === "never") return;
    const key = autoSelectResetKey;
    if (prevAutoSelectResetKeyRef.current === null) {
      prevAutoSelectResetKeyRef.current = key;
      return;
    }
    if (prevAutoSelectResetKeyRef.current !== key) {
      prevAutoSelectResetKeyRef.current = key;
      skipAutoSelectRef.current = false;
    }
  }, [autoSelectProjeto, autoSelectResetKey]);

  useEffect(() => {
    if (autoSelectProjeto === "never") return;
    const cur = String(projetoValue ?? "");
    const prev = prevProjetoForSkipRef.current;
    if (prev !== undefined) {
      if (prev.trim() && !cur.trim()) {
        skipAutoSelectRef.current = true;
      }
      if (!prev.trim() && cur.trim()) {
        skipAutoSelectRef.current = false;
      }
    }
    prevProjetoForSkipRef.current = cur;
  }, [projetoValue, autoSelectProjeto]);

  // Auto-seleciona um projeto padrão (configurável por tela)
  useEffect(() => {
    if (
      autoSelectProjeto !== "never" &&
      projetos &&
      Array.isArray(projetos) &&
      projetosOptions.length > 0
    ) {
      if (
        autoSelectProjeto === "whenProduto" &&
        (!produtoAtual || !produtoSelecionado)
      ) {
        return;
      }

      if (skipAutoSelectRef.current) {
        return;
      }

      const projetoAtualValue = String(getValues(name) ?? "");
      // Só definir se ainda não houver projeto selecionado
      if (!projetoAtualValue || projetoAtualValue === "") {
        const hoje = new Date();
        const hojeLocal = new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          hoje.getDate(),
          0,
          0,
          0,
          0,
        );

        const projetosAtivosHoje = projetos
          .map((p: Projeto) => {
            const di = parseLocalDate(p.data_inicial);
            const df = parseLocalDate(p.data_final);
            if (!di || !df) return null;
            if (di > hojeLocal || df < hojeLocal) return null;
            return { p, di };
          })
          .filter(Boolean) as Array<{ p: Projeto; di: Date }>;

        // Se houver mais de um ativo, usa o de data_inicial mais recente.
        projetosAtivosHoje.sort((a, b) => b.di.getTime() - a.di.getTime());
        const projetoAtivo = projetosAtivosHoje[0]?.p;

        if (projetoAtivo) {
          setValue(name, String(projetoAtivo.id));
        } else {
          // Fallback: pega a primeira opção disponível.
          const primeiroProjeto = projetosOptions[0];
          if (primeiroProjeto) {
            setValue(name, primeiroProjeto.value);
          }
        }
      }
    }
  }, [
    autoSelectProjeto,
    produtoAtual,
    produtoSelecionado,
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
            (!produtoAtual || (!produtoSelecionado && !setorFromEdit))) ||
          (requireSetorProjetoResolved && !setorProjetoResolved)
        }
        required={required}
        onOpenChange={
          lazyLoadComboboxOptions && !useExternalProjetos
            ? (open) => open && setOptionsRequested(true)
            : undefined
        }
        hideLabel={hideLabel}
        wrapperClassName={wrapperClassName}
        controlHeightClassName={controlHeightClassName}
        valueLabelPrefix={valueLabelPrefix}
      />
    </div>
  );
}
