"use client";

import { useCallback, useMemo, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CasoFormProvider,
  CasoFormProduto,
  CasoFormVersao,
  CasoFormStatus,
  CasoFormModulo,
  CasoFormCategoria,
} from "@/components/caso-form";
import { importanceOptions } from "@/mocks/teste";
import { useCategorias } from "@/hooks/use-categorias";
import { Filter, Search } from "lucide-react";

interface CasosFiltersForm {
  produto: string;
  versao: string;
  status: string;
  modulo: string;
  categoria: string; // Nome do campo no form
  descricao_resumo: string;
}

interface CasosFiltrosProps {
  filtrosIniciais: {
    produto: string;
    versao: string;
    status: string;
    modulo: string;
    tipo_categoria: string; // Nome na URL
    descricao_resumo: string;
  };
}

export function CasosFiltros({ filtrosIniciais }: CasosFiltrosProps) {
  const router = useRouter();
  const { data: categorias = [] } = useCategorias();

  // Resolver tipo_categoria da URL (label ou id) para o id usado no form/Combobox
  const categoriaIdFromUrl = useMemo(() => {
    const t = filtrosIniciais.tipo_categoria?.trim();
    if (!t) return "";
    const byLabel = categorias.find((c) => c.tipo_categoria === t);
    if (byLabel) return byLabel.id;
    const byId = categorias.find((c) => c.id === t);
    return byId ? byId.id : t;
  }, [filtrosIniciais.tipo_categoria, categorias]);

  const methods = useForm<CasosFiltersForm>({
    // defaultValues: {
    //   ...filtrosIniciais,
    //   categoria: categoriaIdFromUrl || filtrosIniciais.tipo_categoria,
    // },
  });

  // Sincronizar form quando filtros iniciais ou categorias mudarem (URL mudou ou categorias carregaram)
  useEffect(() => {
    methods.reset({
      ...filtrosIniciais,
      categoria: categoriaIdFromUrl || filtrosIniciais.tipo_categoria,
    });
  }, [filtrosIniciais, categoriaIdFromUrl, methods]);

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
    if (values.status?.trim()) {
      params.set("status", values.status.trim());
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
    if (values.descricao_resumo?.trim()) {
      params.set("descricao_resumo", values.descricao_resumo.trim());
    }

    router.push(`/casos?${params.toString()}`);
  }, [methods, router, categorias]);

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
        <Card className="bg-card shadow-card rounded-lg shrink-0 mb-6">
          <CardHeader className="p-5 pb-2 border-b border-border-divider">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-text-primary" />
              <CardTitle className="text-sm font-semibold text-text-primary">
                Filtros
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <CasoFormProduto required={false} />
              <CasoFormVersao required={false} />
              <CasoFormModulo required={false} />
              <CasoFormStatus />
              <CasoFormCategoria required={false} />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-2 sm:col-span-2 lg:col-span-4">
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
