"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormSetor } from "@/components/fields/caso-form-setor";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { CasoFormProjeto } from "@/components/fields/caso-form-projeto";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { RefreshCcw } from "lucide-react";
import { importanceOptions } from "@/mocks/teste";

export interface MinhaVisaoFiltrosValues {
  setor: string;
  produto_id: string;
  id_projeto: string;
}

interface MinhaVisaoFiltrosProps {
  filtrosIniciais: MinhaVisaoFiltrosValues;
  /** Chamado após aplicar os filtros na URL (ex.: invalidar queries). */
  onAfterFiltrar?: () => void;
}

interface MinhaVisaoFiltersForm {
  setor: string;
  produto: string;
  projeto_id: string;
}

export function MinhaVisaoFiltros({
  filtrosIniciais,
  onAfterFiltrar,
}: MinhaVisaoFiltrosProps) {
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
      produto: filtrosIniciais.produto_id ?? "",
      projeto_id: filtrosIniciais.id_projeto ?? "",
    },
  });

  // Sincronizar form quando filtros iniciais ou setores mudarem (URL mudou ou setores carregaram)
  useEffect(() => {
    methods.reset({
      setor: setorIdFromUrl || (filtrosIniciais.setor ?? ""),
      produto: filtrosIniciais.produto_id ?? "",
      projeto_id: filtrosIniciais.id_projeto ?? "",
    });
  }, [filtrosIniciais, setorIdFromUrl, methods]);

  const produto = methods.watch("produto");

  const handleAtualizar = useCallback(() => {
    const values = methods.getValues();
    const params = new URLSearchParams();

    if (values.setor?.trim()) {
      const setorEncontrado = setores.find(
        (s) => String(s.id) === values.setor.trim(),
      );
      params.set(
        "setor",
        setorEncontrado ? setorEncontrado.nome : values.setor.trim(),
      );
    }
    if (values.produto?.trim()) {
      params.set("produto_id", values.produto.trim());
    }
    if (values.projeto_id?.trim()) {
      params.set("id_projeto", values.projeto_id.trim());
    }

    const qs = params.toString();
    router.push(qs ? `/painel/minha-visao?${qs}` : "/painel/minha-visao");
    onAfterFiltrar?.();
  }, [methods, router, setores, onAfterFiltrar]);

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto,
      isDisabled: false,
      lazyLoadComboboxOptions: false,
    }),
    [methods, produto],
  );

  return (
    <CasoFormProvider value={providerValue}>
      <FormProvider {...methods}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-[230px]">
            <CasoFormSetor
              required={false}
              hideLabel
              valueLabelPrefix="Setor: "
            />
          </div>
          <div className="w-full sm:w-[230px]">
            <CasoFormProduto
              required={false}
              hideLabel
              valueLabelPrefix="Produto: "
            />
          </div>
          <div className="w-full sm:w-[230px]">
            <CasoFormProjeto
              name="projeto_id"
              required={false}
              requireProduto={false}
              requireSetorProjeto={false}
              autoSelectProjeto="never"
              hideLabel
              valueLabelPrefix="Projeto: "
            />
          </div>
          <Button
            type="button"
            size="lg"
            onClick={handleAtualizar}
            className="w-full sm:w-auto h-9 px-4 shrink-0"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Atualizar
          </Button>
        </div>
      </FormProvider>
    </CasoFormProvider>
  );
}
