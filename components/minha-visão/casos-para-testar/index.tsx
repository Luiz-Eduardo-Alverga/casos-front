"use client";

import { useEffect, useMemo } from "react";
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
import { EmptyState } from "@/components/painel/empty-state";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasosParaTestarSkeleton } from "./casos-para-testar-skeleton";
import { CasosParaTestarVersoesTable } from "./casos-para-testar-versoes-table";
import { CasosParaTestarDistribuicaoTable } from "./casos-para-testar-distribuicao-table";
import { cn } from "@/lib/utils";
import { importanceOptions } from "@/mocks/teste";
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

interface DevFiltroForm {
  atribuido_para: string;
  atribuido_para_label: string;
}

interface CasosParaTestarProps {
  view: CasosParaTestarView;
  onViewChange: (value: CasosParaTestarView) => void;
  agruparPor: VisaoGeralAgruparPor;
  onAgruparPorChange: (value: VisaoGeralAgruparPor) => void;
  atribuidoPara: string;
  onAtribuidoParaChange: (value: string) => void;
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
  geralData,
  distribuicaoData,
  distribuicaoTotais,
  isLoading = false,
}: CasosParaTestarProps) {
  const methods = useForm<DevFiltroForm>({
    defaultValues: {
      atribuido_para: atribuidoPara,
      atribuido_para_label: "",
    },
  });

  useEffect(() => {
    methods.setValue("atribuido_para", atribuidoPara);
  }, [atribuidoPara, methods]);

  const atribuidoParaWatch = methods.watch("atribuido_para");

  useEffect(() => {
    const next = atribuidoParaWatch?.trim() ?? "";
    if (next !== atribuidoPara) {
      onAtribuidoParaChange(next);
    }
  }, [atribuidoParaWatch, atribuidoPara, onAtribuidoParaChange]);

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto: "",
      isDisabled: false,
      lazyLoadComboboxOptions: false,
    }),
    [methods],
  );

  const agruparPorLabel = useMemo(
    () =>
      AGRUPAR_POR_OPTIONS.find((option) => option.value === agruparPor)
        ?.label ?? "",
    [agruparPor],
  );
  const hasAgruparPorValue = Boolean(agruparPorLabel);

  if (isLoading) {
    return <CasosParaTestarSkeleton />;
  }

  const isEmpty =
    view === "geral" ? geralData.length === 0 : distribuicaoData.length === 0;

  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="flex flex-col sm:flex-row items-stretch justify-between sm:items-center gap-2 flex-wrap p-4 pb-2 border-b border-border-divider">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-text-primary shrink-0" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Casos para testar
          </CardTitle>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
          <Tabs
            value={view}
            onValueChange={(value) => onViewChange(value as CasosParaTestarView)}
          >
            <TabsList className="h-8 p-0.5">
              <TabsTrigger value="distribuicao" className="h-7 px-2.5 text-xs">
                Distribuição
              </TabsTrigger>
              <TabsTrigger value="geral" className="h-7 px-2.5 text-xs">
                Geral
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={agruparPor}
            onValueChange={(value) =>
              onAgruparPorChange(value as VisaoGeralAgruparPor)
            }
            disabled={view !== "geral"}
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
              {AGRUPAR_POR_OPTIONS.map((option) => (
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
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isEmpty ? (
          <EmptyState
            title="Nenhum caso para testar"
            description="Não há casos para testar no momento com os filtros selecionados."
            className="py-8"
          />
        ) : view === "geral" ? (
          <CasosParaTestarVersoesTable
            data={geralData}
            agruparPor={agruparPor}
          />
        ) : (
          <CasosParaTestarDistribuicaoTable
            data={distribuicaoData}
            totais={distribuicaoTotais}
          />
        )}
      </CardContent>
    </Card>
  );
}

export { CasosParaTestarSkeleton } from "./casos-para-testar-skeleton";
