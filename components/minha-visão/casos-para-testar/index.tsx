"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/painel/empty-state";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { CasosParaTestarContentSkeleton } from "./casos-para-testar-skeleton";
import { CasosParaTestarVersoesTable } from "./casos-para-testar-versoes-table";
import { CasosParaTestarDistribuicaoTable } from "./casos-para-testar-distribuicao-table";
import { cn } from "@/lib/utils";
import { importanceOptions } from "@/mocks/teste";
import { useVersoes } from "@/hooks/catalogos/use-versoes";
import {
  findSequenciaByVersaoProduto,
  resolveVersaoProdutoForApi,
} from "@/components/casos/shared/versao-combobox";
import type {
  VisaoGeralAgruparPor,
  VisaoGeralItem,
} from "@/services/sprint/get-visao-geral";
import type {
  VisaoDistribuicaoItem,
  VisaoDistribuicaoTotais,
} from "@/services/sprint/get-visao-distribuicao";

const AGRUPAR_POR_VALUE_PREFIX = "Agrupar: ";

export type CasosParaTestarView = "geral" | "distribuicao";

const AGRUPAR_POR_OPTIONS: Array<{
  value: VisaoGeralAgruparPor;
  label: string;
}> = [
  { value: "versao", label: "Versão" },
  { value: "produto", label: "Produto" },
  { value: "projeto", label: "Projeto" },
  { value: "atribuido_para", label: "Atribuído para" },
];

const AGRUPAR_POR_DISTRIBUICAO = new Set<VisaoGeralAgruparPor>([
  "versao",
  "atribuido_para",
]);

const AGRUPAR_POR_DISTRIBUICAO_DEFAULT: VisaoGeralAgruparPor = "atribuido_para";

interface FiltroForm {
  atribuido_para: string;
  atribuido_para_label: string;
  versao: string;
  produto: string;
}

interface CasosParaTestarProps {
  view: CasosParaTestarView;
  onViewChange: (value: CasosParaTestarView) => void;
  agruparPor: VisaoGeralAgruparPor;
  onAgruparPorChange: (value: VisaoGeralAgruparPor) => void;
  atribuidoPara: string;
  onAtribuidoParaChange: (value: string) => void;
  versao: string;
  onVersaoChange: (value: string) => void;
  produtoId?: string;
  projetoId?: string;
  geralData: VisaoGeralItem[];
  distribuicaoData: VisaoDistribuicaoItem[];
  distribuicaoTotais?: VisaoDistribuicaoTotais;
  isLoading?: boolean;
}

export function CasosParaTestar({
  view,
  onViewChange,
  agruparPor,
  onAgruparPorChange,
  atribuidoPara,
  onAtribuidoParaChange,
  versao,
  onVersaoChange,
  produtoId = "",
  projetoId,
  geralData,
  distribuicaoData,
  distribuicaoTotais,
  isLoading = false,
}: CasosParaTestarProps) {
  const methods = useForm<FiltroForm>({
    defaultValues: {
      atribuido_para: atribuidoPara,
      atribuido_para_label: "",
      versao: "",
      produto: produtoId,
    },
  });

  const hasProduto = Boolean(produtoId.trim());

  const { data: versoesCatalog } = useVersoes({
    produto_id: produtoId,
    enabled: hasProduto && view === "distribuicao",
    todas: true,
  });

  const versaoRef = useRef(versao);
  versaoRef.current = versao;
  const catalogRef = useRef(versoesCatalog);
  catalogRef.current = versoesCatalog;
  const onVersaoChangeRef = useRef(onVersaoChange);
  onVersaoChangeRef.current = onVersaoChange;

  useEffect(() => {
    methods.setValue("atribuido_para", atribuidoPara);
  }, [atribuidoPara, methods]);

  useEffect(() => {
    const atual = methods.getValues("produto");
    if (atual === produtoId) return;
    methods.setValue("produto", produtoId, { shouldDirty: false });
    methods.setValue("versao", "", { shouldDirty: false });
    if (versaoRef.current) {
      onVersaoChangeRef.current("");
    }
  }, [produtoId, methods]);

  useEffect(() => {
    if (!hasProduto) return;

    const versaoTexto = versao.trim();
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
  }, [hasProduto, versao, versoesCatalog, methods]);

  useEffect(() => {
    if (!hasProduto) return;

    const subscription = methods.watch((values, info) => {
      if (info.name != null && info.name !== "versao") return;

      const sequencia = String(values.versao ?? "").trim();
      const atualFiltro = versaoRef.current || "";

      if (!sequencia) {
        if (atualFiltro) onVersaoChangeRef.current("");
        return;
      }

      const texto = resolveVersaoProdutoForApi(sequencia, catalogRef.current);
      if (texto && texto !== atualFiltro) {
        onVersaoChangeRef.current(texto);
      }
    });

    return () => subscription.unsubscribe();
  }, [hasProduto, methods]);

  const atribuidoParaWatch = methods.watch("atribuido_para");

  useEffect(() => {
    const next = atribuidoParaWatch?.trim() ?? "";
    if (next !== atribuidoPara) {
      onAtribuidoParaChange(next);
    }
  }, [atribuidoParaWatch, atribuidoPara, onAtribuidoParaChange]);

  useEffect(() => {
    if (view === "distribuicao" && !AGRUPAR_POR_DISTRIBUICAO.has(agruparPor)) {
      onAgruparPorChange(AGRUPAR_POR_DISTRIBUICAO_DEFAULT);
    }
  }, [view, agruparPor, onAgruparPorChange]);

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto: produtoId,
      isDisabled: false,
      lazyLoadComboboxOptions: false,
    }),
    [methods, produtoId],
  );

  const agruparPorOptions = useMemo(
    () =>
      view === "distribuicao"
        ? AGRUPAR_POR_OPTIONS.filter((option) =>
            AGRUPAR_POR_DISTRIBUICAO.has(option.value),
          )
        : AGRUPAR_POR_OPTIONS,
    [view],
  );

  const agruparPorLabel = useMemo(
    () =>
      agruparPorOptions.find((option) => option.value === agruparPor)?.label ??
      "",
    [agruparPor, agruparPorOptions],
  );
  const hasAgruparPorValue = Boolean(agruparPorLabel);

  const handleViewChange = (value: CasosParaTestarView) => {
    if (value === "distribuicao") {
      onAgruparPorChange(AGRUPAR_POR_DISTRIBUICAO_DEFAULT);
    }
    onViewChange(value);
  };

  const isEmpty =
    view === "geral" ? geralData.length === 0 : distribuicaoData.length === 0;

  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="flex flex-col sm:flex-row items-stretch justify-between sm:items-center gap-2 flex-wrap p-4 pb-2 border-b border-border-divider">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-text-primary shrink-0" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Gerenciamento de casos
          </CardTitle>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
          <Tabs
            value={view}
            onValueChange={(value) =>
              handleViewChange(value as CasosParaTestarView)
            }
          >
            <TabsList className="h-8 p-0.5">
              <TabsTrigger value="geral" className="h-7 px-2.5 text-xs">
                Geral
              </TabsTrigger>
              <TabsTrigger value="distribuicao" className="h-7 px-2.5 text-xs">
                Distribuição
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={agruparPor}
            onValueChange={(value) =>
              onAgruparPorChange(value as VisaoGeralAgruparPor)
            }
          >
            <SelectTrigger
              className={cn(
                "h-8 w-full sm:w-[200px] rounded-lg border border-input bg-background px-3 shadow-sm",
                "text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                "focus:ring-1 focus:ring-ring data-[placeholder]:text-muted-foreground",
                hasAgruparPorValue
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <span className="truncate">
                {hasAgruparPorValue
                  ? `${AGRUPAR_POR_VALUE_PREFIX}${agruparPorLabel}`
                  : "Agrupar por"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {agruparPorOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-sm"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {view === "distribuicao" ? (
            hasProduto ? (
              <CasoFormProvider value={providerValue}>
                <FormProvider {...methods}>
                  <div className="w-full sm:w-[200px]">
                    <CasoFormVersao
                      required={false}
                      todas
                      hideLabel
                      valueLabelPrefix="Versão: "
                      wrapperClassName="w-full"
                      controlHeightClassName="h-8"
                    />
                  </div>
                </FormProvider>
              </CasoFormProvider>
            ) : (
              <div className="w-full sm:w-[200px]">
                <Input
                  value={versao}
                  onChange={(e) => onVersaoChange(e.target.value)}
                  placeholder="Filtrar por versão"
                  className="h-8 text-sm"
                />
              </div>
            )
          ) : (
            <CasoFormProvider value={providerValue}>
              <FormProvider {...methods}>
                <div className="w-full sm:w-[200px]">
                  <CasoFormDevAtribuido
                    name="atribuido_para"
                    labelName="atribuido_para_label"
                    required={false}
                    requireProduto={false}
                    hideLabel
                    valueLabelPrefix="Dev: "
                    placeholder="Todos os devs"
                    wrapperClassName="w-full"
                    controlHeightClassName="h-8"
                  />
                </div>
              </FormProvider>
            </CasoFormProvider>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <CasosParaTestarContentSkeleton />
        ) : isEmpty ? (
          <EmptyState
            title="Nenhum caso para testar"
            description="Não há casos para testar no momento com os filtros selecionados."
            className="py-8"
          />
        ) : view === "geral" ? (
          <CasosParaTestarVersoesTable
            data={geralData}
            agruparPor={agruparPor}
            projetoId={projetoId}
          />
        ) : (
          <CasosParaTestarDistribuicaoTable
            data={distribuicaoData}
            totais={distribuicaoTotais}
            agruparPor={agruparPor}
          />
        )}
      </CardContent>
    </Card>
  );
}

export { CasosParaTestarSkeleton } from "./casos-para-testar-skeleton";
