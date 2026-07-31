"use client";

import { useEffect, useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Filter, FilterX, Layers, ListFilter, PackageSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { useProdutos } from "@/hooks/catalogos/use-produtos";
import { useVersoes } from "@/hooks/catalogos/use-versoes";
import { produtosToOptions } from "@/components/liberacoes/utils";
import {
  STATUS_LIBERACAO_OPTIONS,
  TIPO_LIBERACAO_OPTIONS,
} from "@/components/liberacoes/constants";
import {
  findSequenciaByVersaoProduto,
  resolveVersaoProdutoForApi,
} from "@/components/casos/shared/versao-combobox";
import type { LiberacoesFiltrosState } from "@/components/liberacoes/filtros/liberacoes-filtros.types";
import { hasFiltersApplied } from "@/components/liberacoes/filtros/liberacoes-filtros-mappers";

interface LiberacoesFiltrosProps {
  filtros: LiberacoesFiltrosState;
  onFiltroChange: <K extends keyof LiberacoesFiltrosState>(
    key: K,
    value: LiberacoesFiltrosState[K],
  ) => void;
  onLimpar: () => void;
}

type FiltrosFormValues = {
  produto: string;
  versao: string;
};

const STATUS_OPTIONS = STATUS_LIBERACAO_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

const TIPO_OPTIONS = TIPO_LIBERACAO_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

export function LiberacoesFiltros({
  filtros,
  onFiltroChange,
  onLimpar,
}: LiberacoesFiltrosProps) {
  const { data: produtos, isLoading: isProdutosLoading } = useProdutos();
  const produtoOptions = useMemo(() => produtosToOptions(produtos), [produtos]);

  const methods = useForm<FiltrosFormValues>({
    defaultValues: {
      produto: filtros.produtoId || "",
      versao: "",
    },
  });

  const produtoId = filtros.produtoId || "";

  const { data: versoesCatalog } = useVersoes({
    produto_id: produtoId,
    enabled: Boolean(produtoId),
    todas: true,
  });

  const filtrosRef = useRef(filtros);
  filtrosRef.current = filtros;
  const catalogRef = useRef(versoesCatalog);
  catalogRef.current = versoesCatalog;
  const onFiltroChangeRef = useRef(onFiltroChange);
  onFiltroChangeRef.current = onFiltroChange;

  // Mantém `produto` no form só para o CasoFormVersao (fonte da verdade = filtros).
  useEffect(() => {
    const atual = methods.getValues("produto");
    if (atual === produtoId) return;
    methods.setValue("produto", produtoId, { shouldDirty: false });
    methods.setValue("versao", "", { shouldDirty: false });
  }, [produtoId, methods]);

  // Hidrata sequencia a partir do texto da URL quando o catálogo carrega.
  useEffect(() => {
    const versaoTexto = filtros.versao?.trim();
    if (!versaoTexto || !versoesCatalog?.length) {
      if (!versaoTexto && methods.getValues("versao")) {
        methods.setValue("versao", "", { shouldDirty: false });
      }
      return;
    }

    const atual = methods.getValues("versao");
    if (resolveVersaoProdutoForApi(atual, versoesCatalog) === versaoTexto) {
      return;
    }

    const sequencia = findSequenciaByVersaoProduto(versoesCatalog, versaoTexto);
    if (sequencia && sequencia !== atual) {
      methods.setValue("versao", sequencia, { shouldDirty: false });
    }
  }, [filtros.versao, versoesCatalog, methods]);

  // Empurra mudanças de versão do form → URL (sem loop).
  useEffect(() => {
    const subscription = methods.watch((values, info) => {
      if (info.name != null && info.name !== "versao") return;

      const sequencia = String(values.versao ?? "").trim();
      const atualFiltro = filtrosRef.current.versao || "";

      if (!sequencia) {
        if (atualFiltro) onFiltroChangeRef.current("versao", "");
        return;
      }

      const texto = resolveVersaoProdutoForApi(
        sequencia,
        catalogRef.current,
      );
      if (texto && texto !== atualFiltro) {
        onFiltroChangeRef.current("versao", texto);
      }
    });

    return () => subscription.unsubscribe();
  }, [methods]);

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions: [],
      produto: produtoId,
      isDisabled: false,
    }),
    [methods, produtoId],
  );

  const handleProdutoChange = (value: string) => {
    onFiltroChange("produtoId", value);
    if (filtros.versao) onFiltroChange("versao", "");
    methods.setValue("produto", value, { shouldDirty: false });
    methods.setValue("versao", "", { shouldDirty: false });
  };

  const handleLimpar = () => {
    methods.reset({ produto: "", versao: "" });
    onLimpar();
  };

  return (
    <Card className="mb-2 shrink-0 rounded-lg bg-card shadow-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border-divider px-5 py-2">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Filtros
          </CardTitle>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLimpar}
          disabled={!hasFiltersApplied(filtros)}
          className="h-8 px-2 text-text-secondary"
        >
          <FilterX className="h-3.5 w-3.5" />
          Limpar filtros
        </Button>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        <FormProvider {...methods}>
          <CasoFormProvider value={providerValue}>
            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ComboboxField
                label="Produto"
                icon={PackageSearch}
                options={produtoOptions}
                value={produtoId}
                onValueChange={handleProdutoChange}
                placeholder="Todos os produtos"
                emptyText="Nenhum produto encontrado."
                isLoading={isProdutosLoading}
                controlHeightClassName="h-9"
              />

              <ComboboxField
                label="Status"
                icon={ListFilter}
                options={STATUS_OPTIONS}
                value={filtros.status}
                onValueChange={(v) => onFiltroChange("status", v)}
                placeholder="Todos os status"
                emptyText="Nenhum status encontrado."
                controlHeightClassName="h-9"
              />

              <ComboboxField
                label="Tipo de liberação"
                icon={Layers}
                options={TIPO_OPTIONS}
                value={filtros.tipoLiberacao}
                onValueChange={(v) => onFiltroChange("tipoLiberacao", v)}
                placeholder="Todos os tipos"
                emptyText="Nenhum tipo encontrado."
                controlHeightClassName="h-9"
              />

              <CasoFormVersao required={false} todas />
            </div>
          </CasoFormProvider>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
