"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { getUser } from "@/lib/auth";
import { useCreateProduto } from "@/hooks/produtos/use-create-produto";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { useRelatores } from "@/hooks/catalogos/use-usuarios";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import {
  getProdutoCreateDefaultValues,
  produtoFormSchema,
  type ProdutoFormData,
} from "@/components/produtos/cadastro/schema";
import { buildCreateProdutoPayload } from "@/components/produtos/cadastro/utils";
import { ProdutoCreateHeader } from "@/components/produtos/cadastro/produto-create-header";
import { ProdutoCreateFooter } from "@/components/produtos/cadastro/produto-create-footer";
import { ProdutoDadosForm } from "@/components/produtos/cadastro/produto-dados-form";
import { ProdutoExibicaoSwitches } from "@/components/produtos/cadastro/produto-exibicao-switches";

const FORM_ID = "produto-create-form";

export function ProdutoCreateForm() {
  const router = useRouter();
  const user = getUser();
  const { data: setores } = useSetores({ enabled: true });
  const { data: usuarios } = useRelatores({ enabled: true });
  const { mutateAsync: createProdutoAsync, isPending } = useCreateProduto();

  const methods = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoFormSchema),
    defaultValues: getProdutoCreateDefaultValues(),
  });

  async function onSubmit(data: ProdutoFormData) {
    try {
      const payload = buildCreateProdutoPayload(data, {
        setores,
        usuarios,
        currentUser: user,
      });
      const response = await createProdutoAsync(payload);
      const registro = response?.data?.Registro;

      toast.success(PRODUTO_LABELS.criadoSucesso);
      if (registro != null) {
        router.push(`/produtos/${registro}?aba=versoes`);
        return;
      }
      router.push("/produtos");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : PRODUTO_LABELS.erroCriar,
      );
    }
  }

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions: [],
      isDisabled: methods.formState.isSubmitting || isPending,
      lazyLoadComboboxOptions: false,
    }),
    [methods, isPending],
  );

  const isSubmitting = methods.formState.isSubmitting || isPending;
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <div className="flex-1 overflow-auto px-6 pb-32 pt-20">
      <CasoFormProvider value={providerValue}>
        <FormProvider {...methods}>
          <form
            id={FORM_ID}
            onSubmit={methods.handleSubmit(onSubmit, () => {
              toast.error(PRODUTO_LABELS.reviseObrigatorios);
            })}
            className="flex flex-col gap-6"
          >
            <ProdutoCreateHeader onBack={() => router.push("/produtos")} />

            <div className="flex min-h-0 flex-col gap-6 lg:flex-row">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <ProdutoDadosForm />
                {!isDesktop ? <ProdutoExibicaoSwitches /> : null}
              </div>
              {isDesktop ? (
                <aside className="flex w-full shrink-0 flex-col gap-2 lg:sticky lg:top-20 lg:w-[360px] lg:self-start">
                  <ProdutoExibicaoSwitches showIntro />
                </aside>
              ) : null}
            </div>
          </form>

          <ProdutoCreateFooter
            formId={FORM_ID}
            isSubmitting={isSubmitting}
            isSaving={isPending}
            onCancel={() => router.push("/produtos")}
          />
        </FormProvider>
      </CasoFormProvider>
    </div>
  );
}
