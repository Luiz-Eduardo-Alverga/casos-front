"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CasoFormProvider } from "@/components/caso-form/provider";
import { CasoFormSetor } from "@/components/fields/caso-form-setor";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { useSetores } from "@/hooks/use-setores";
import { FileText, Search } from "lucide-react";
import { importanceOptions } from "@/mocks/teste";

interface MinhaVisaoFiltersForm {
  setor: string;
  produto: string;
}

interface MinhaVisaoFiltrosProps {
  filtrosIniciais: {
    setor: string;
    produto: string;
  };
}

export function MinhaVisaoFiltros({ filtrosIniciais }: MinhaVisaoFiltrosProps) {
  const router = useRouter();
  const { data: setores = [] } = useSetores();

  // Resolver setor da URL (nome) para o id usado no form/Combobox
  const setorIdFromUrl = useMemo(() => {
    const nome = filtrosIniciais.setor?.trim();
    if (!nome) return "";
    const byNome = setores.find((s) => s.nome === nome);
    if (byNome) return String(byNome.id);
    const byId = setores.find((s) => String(s.id) === nome);
    return byId ? String(byId.id) : nome;
  }, [filtrosIniciais.setor, setores]);

  const methods = useForm<MinhaVisaoFiltersForm>({
    defaultValues: {
      setor: setorIdFromUrl || (filtrosIniciais.setor ?? ""),
      produto: filtrosIniciais.produto ?? "",
    },
  });

  // Sincronizar form quando filtros iniciais ou setores mudarem (URL mudou ou setores carregaram)
  useEffect(() => {
    methods.reset({
      setor: setorIdFromUrl || (filtrosIniciais.setor ?? ""),
      produto: filtrosIniciais.produto ?? "",
    });
  }, [filtrosIniciais, setorIdFromUrl, methods]);

  const produto = methods.watch("produto");

  const handleFiltrar = useCallback(() => {
    const values = methods.getValues();
    const params = new URLSearchParams();

    if (values.setor?.trim()) {
      const setorEncontrado = setores.find((s) => String(s.id) === values.setor.trim());
      params.set("setor", setorEncontrado ? setorEncontrado.nome : values.setor.trim());
    }
    if (values.produto?.trim()) {
      params.set("produto", values.produto.trim());
    }

    router.push(`/painel/minha-visao?${params.toString()}`);
  }, [methods, router, setores]);

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto,
      isDisabled: false,
      lazyLoadComboboxOptions: false,
    }),
    [methods, produto]
  );

  return (
    <CasoFormProvider value={providerValue}>
      <FormProvider {...methods}>
        <Card className="bg-card shadow-card rounded-lg shrink-0 mb-6">
          <CardHeader className="p-5 pb-2 border-b border-border-divider">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-text-primary" />
              <CardTitle className="text-sm font-semibold text-text-primary">
                Filtros
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <CasoFormSetor required={false} />
              <CasoFormProduto required={false} />
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  size="lg"
                  onClick={handleFiltrar}
                  className="w-full sm:w-48 h-9"
                >
                  <Search className="h-3.5 w-3.5" />
                  Filtrar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </FormProvider>
    </CasoFormProvider>
  );
}
