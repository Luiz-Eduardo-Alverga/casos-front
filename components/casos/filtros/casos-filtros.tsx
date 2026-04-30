"use client";

import { useCallback, useMemo, useEffect, useState, useRef } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CasoFormProvider,
  CasoFormProduto,
  CasoFormVersao,
  CasoFormModulo,
  CasoFormCategoria,
  CasoFormUsuarioAbertura,
} from "@/components/caso-form";
import { StatusMultiSelect } from "@/components/fields/status-multi-select";
import { importanceOptions } from "@/mocks/teste";
import { useCategorias } from "@/hooks/use-categorias";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { CasosFiltrosSheet } from "@/components/casos/filtros/casos-filtros-sheet";

interface CasosFiltersForm {
  produto: string;
  versao: string;
  modulo: string;
  categoria: string;
  tipo_abertura: "" | "CASO" | "REPORT";
  descricao_resumo: string;
  status_ids: string[];
  usuario_abertura_id: string;
  devAtribuido: string;
  qaAtribuido: string;
  data_producao_inicio: Date | undefined;
  data_producao_fim: Date | undefined;
}

interface CasosFiltrosProps {
  filtrosIniciais: {
    produto: string;
    versao: string;
    modulo: string;
    tipo_categoria: string;
    tipo_abertura?: string;
    descricao_resumo: string;
    status_ids: string[];
    usuario_abertura_id: string;
    usuario_dev_id?: string;
    usuario_qa_id?: string;
    data_producao_inicio?: string;
    data_producao_fim?: string;
  };
  /** Mesma string usada no pai (`searchParams.toString()`): só muda quando a query da URL muda. */
  urlQueryKey: string;
}

function parseYmdToDate(value: string | null | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const s = value.trim();
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return undefined;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0);
}

function dateToYmd(date: Date | undefined): string | undefined {
  if (!date) return undefined;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function CasosFiltros({
  filtrosIniciais,
  urlQueryKey,
}: CasosFiltrosProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categorias = [] } = useCategorias();
  const [sheetOpen, setSheetOpen] = useState(false);

  const categoriaIdFromUrl = useMemo(() => {
    const t = filtrosIniciais.tipo_categoria?.trim();
    if (!t) return "";
    const byLabel = categorias.find((c) => c.tipo_categoria === t);
    if (byLabel) return byLabel.id;
    const byId = categorias.find((c) => c.id === t);
    return byId ? byId.id : t;
  }, [filtrosIniciais.tipo_categoria, categorias]);

  const methods = useForm<CasosFiltersForm>({
    defaultValues: {
      produto: "",
      versao: "",
      modulo: "",
      categoria: "",
      tipo_abertura: "",
      descricao_resumo: "",
      status_ids: [],
      usuario_abertura_id: "",
      devAtribuido: "",
      qaAtribuido: "",
      data_producao_inicio: undefined,
      data_producao_fim: undefined,
    },
  });

  const lastSyncedUrlQueryKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const prevKey = lastSyncedUrlQueryKeyRef.current;
    if (prevKey !== urlQueryKey) {
      lastSyncedUrlQueryKeyRef.current = urlQueryKey;
      methods.reset({
        produto: filtrosIniciais.produto,
        versao: filtrosIniciais.versao,
        modulo: filtrosIniciais.modulo,
        descricao_resumo: filtrosIniciais.descricao_resumo,
        categoria: categoriaIdFromUrl || filtrosIniciais.tipo_categoria,
        tipo_abertura:
          filtrosIniciais.tipo_abertura === "CASO" ||
          filtrosIniciais.tipo_abertura === "REPORT"
            ? filtrosIniciais.tipo_abertura
            : "",
        status_ids: [...(filtrosIniciais.status_ids ?? [])].slice(0, 5),
        usuario_abertura_id: filtrosIniciais.usuario_abertura_id ?? "",
        devAtribuido: filtrosIniciais.usuario_dev_id ?? "",
        qaAtribuido: filtrosIniciais.usuario_qa_id ?? "",
        data_producao_inicio: parseYmdToDate(
          filtrosIniciais.data_producao_inicio,
        ),
        data_producao_fim: parseYmdToDate(filtrosIniciais.data_producao_fim),
      });
      return;
    }
    methods.setValue(
      "categoria",
      categoriaIdFromUrl || filtrosIniciais.tipo_categoria || "",
      { shouldDirty: false, shouldTouch: false, shouldValidate: false },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `methods.reset`/`setValue` estáveis; não incluir `methods` para não resetar a cada render
  }, [urlQueryKey, categoriaIdFromUrl, filtrosIniciais]);

  const produto = methods.watch("produto");

  const handleFiltrar = useCallback(() => {
    const values = methods.getValues();
    const params = new URLSearchParams();

    if (values.produto?.trim()) {
      params.set("produto", values.produto.trim());
    }
    if (values.versao?.trim()) {
      params.set("versao", values.versao.trim());
    }
    for (const id of values.status_ids ?? []) {
      const s = String(id).trim();
      if (s) params.append("status_id", s);
    }
    if (values.modulo?.trim()) {
      params.set("modulo", values.modulo.trim());
    }
    if (values.categoria?.trim()) {
      const categoria = categorias.find(
        (c) => c.id === values.categoria.trim(),
      );
      const valorTipoCategoria =
        categoria?.tipo_categoria ?? values.categoria.trim();
      params.set("tipo_categoria", valorTipoCategoria);
    }
    if (values.tipo_abertura?.trim()) {
      params.set("tipo_abertura", values.tipo_abertura.trim());
    }
    if (values.descricao_resumo?.trim()) {
      params.set("descricao_resumo", values.descricao_resumo.trim());
    }
    if (values.usuario_abertura_id?.trim()) {
      params.set("usuario_abertura_id", values.usuario_abertura_id.trim());
    }
    if (values.devAtribuido?.trim()) {
      params.set("usuario_dev_id", values.devAtribuido.trim());
    }
    if (values.qaAtribuido?.trim()) {
      params.set("usuario_qa_id", values.qaAtribuido.trim());
    }

    const dataInicio = dateToYmd(values.data_producao_inicio);
    const dataFim = dateToYmd(values.data_producao_fim);
    if (dataInicio) params.set("data_producao_inicio", dataInicio);
    if (dataFim) params.set("data_producao_fim", dataFim);

    router.push(`/casos?${params.toString()}`);
  }, [methods, router, categorias]);

  const handleLimparFiltrosSheet = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("usuario_dev_id");
    params.delete("usuario_qa_id");
    params.delete("data_producao_inicio");
    params.delete("data_producao_fim");
    params.delete("tipo_abertura");
    const qs = params.toString();
    router.push(qs ? `/casos?${qs}` : "/casos");
  }, [router, searchParams]);

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto,
      isDisabled: false,
    }),
    [methods, produto],
  );

  return (
    <CasoFormProvider value={providerValue}>
      <FormProvider {...methods}>
        <Card className="bg-card  shadow-card rounded-lg shrink-0 mb-6">
          <CardHeader className="flex flex-row justify-between px-5 py-2 border-b border-border-divider">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-text-primary" />
              <CardTitle className="text-sm font-semibold text-text-primary">
                Filtros
              </CardTitle>
            </div>

            <div className="flex items-center gap-2">
              <CasosFiltrosSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                trigger={
                  <Button size="sm" variant="outline" type="button">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Mais filtros
                  </Button>
                }
                methods={methods}
                onFiltrar={handleFiltrar}
                onLimpar={handleLimparFiltrosSheet}
              />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <CasoFormProduto required={false} />
              <CasoFormVersao required={false} todas />
              <CasoFormModulo required={false} />
              <CasoFormCategoria required={false} />
              <CasoFormUsuarioAbertura required={false} />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                <Label className="text-sm font-medium text-text-label">
                  Descrição / Resumo
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por descrição ou resumo..."
                    className="pl-9 h-[42px] rounded-lg border-border-input"
                    {...methods.register("descricao_resumo")}
                  />
                </div>
              </div>

              <div className="sm:col-span-1 lg:col-span-2">
                <Controller
                  name="status_ids"
                  control={methods.control}
                  render={({ field }) => (
                    <StatusMultiSelect
                      value={field.value ?? []}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex gap-2 col-span-1">
                <Button
                  type="button"
                  onClick={handleFiltrar}
                  className="w-full px-4 flex-1 sm:flex-initial"
                >
                  <Search className="h-3.5 w-3.5 mr-2" />
                  <span>Filtrar</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </FormProvider>
    </CasoFormProvider>
  );
}
