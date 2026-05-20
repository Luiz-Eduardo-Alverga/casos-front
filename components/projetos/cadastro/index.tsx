"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { importanceOptions } from "@/mocks/teste";
import { getUser } from "@/lib/auth";
import { useCreateSgpCadastro } from "@/hooks/cadastros/use-create-sgp-cadastro";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { SuccessModal } from "@/components/reports-form/success-modal";
import {
  getProjetoCreateDefaultValues,
  projetoCreateFormSchema,
  type ProjetoCreateFormData,
} from "@/components/projetos/cadastro/schema";
import {
  buildCreateSgpProjetoPayload,
  resolveSetorIdByNome,
} from "@/components/projetos/cadastro/utils";
import { ProjetoCreateHeader } from "@/components/projetos/cadastro/projeto-create-header";
import { ProjetoCreateLeftColumn } from "@/components/projetos/cadastro/projeto-create-left-column";
import { ProjetoCreateRightColumn } from "@/components/projetos/cadastro/projeto-create-right-column";
import { ProjetoCreateFooter } from "@/components/projetos/cadastro/projeto-create-footer";

export function ProjetoCreateForm() {
  const router = useRouter();
  const user = getUser();
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [numeroProjeto, setNumeroProjeto] = useState<number | null>(null);
  const stayOnFormAfterModalCloseRef = useRef(false);

  const { data: setores } = useSetores({ enabled: true });
  const { mutateAsync: createProjetoAsync, isPending } = useCreateSgpCadastro();

  const methods = useForm<ProjetoCreateFormData>({
    resolver: zodResolver(projetoCreateFormSchema),
    defaultValues: getProjetoCreateDefaultValues(
      user ? String(user.id) : undefined,
    ),
  });

  const setorValue = methods.watch("setor");

  useEffect(() => {
    if (!user?.setor || setorValue || !setores?.length) return;
    const setorId = resolveSetorIdByNome(user.setor, setores);
    if (setorId) {
      methods.setValue("setor", setorId, { shouldDirty: false });
    }
  }, [user?.setor, setorValue, setores, methods]);

  async function onSubmit(data: ProjetoCreateFormData) {
    try {
      const payload = buildCreateSgpProjetoPayload(data);
      const response = await createProjetoAsync(payload);
      const registro = response?.cadastro?.data?.registro;

      if (registro != null) {
        setNumeroProjeto(registro);
        setSuccessModalOpen(true);
        toast.success(`Projeto ${registro} cadastrado com sucesso.`);
      } else {
        toast.success("Projeto cadastrado com sucesso.");
        router.push("/projetos");
      }
    } catch (error) {
      console.error("Erro ao cadastrar projeto:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao cadastrar projeto.",
      );
    }
  }

  function handleResetForm() {
    methods.reset(
      getProjetoCreateDefaultValues(user ? String(user.id) : undefined),
    );
    if (user?.setor && setores?.length) {
      const setorId = resolveSetorIdByNome(user.setor, setores);
      if (setorId) methods.setValue("setor", setorId);
    }
  }

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      isDisabled: methods.formState.isSubmitting || isPending,
      lazyLoadComboboxOptions: false,
    }),
    [methods, isPending],
  );

  const isSubmitting = methods.formState.isSubmitting || isPending;
  const formId = "projeto-create-form";

  return (
    <div className="flex-1 overflow-auto px-6 pb-24 pt-20">
      <CasoFormProvider value={providerValue}>
        <FormProvider {...methods}>
          <form
            id={formId}
            onSubmit={methods.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <ProjetoCreateHeader onBack={() => router.push("/projetos")} />

            <div className="flex min-h-0 flex-col gap-6 lg:flex-row">
              <ProjetoCreateLeftColumn />
              <ProjetoCreateRightColumn />
            </div>
          </form>

          <ProjetoCreateFooter
            formId={formId}
            isSubmitting={isSubmitting}
            onCancel={() => router.push("/projetos")}
          />

          <SuccessModal
            isOpen={successModalOpen}
            onClose={() => {
              setSuccessModalOpen(false);
              setNumeroProjeto(null);
              if (!stayOnFormAfterModalCloseRef.current) {
                router.push("/projetos");
              }
              stayOnFormAfterModalCloseRef.current = false;
            }}
            numeroCaso={numeroProjeto}
            entitySingular="Projeto"
            novoRegistroButtonLabel="Novo projeto"
            onNovoCasoClick={() => {
              stayOnFormAfterModalCloseRef.current = true;
              handleResetForm();
            }}
          />
        </FormProvider>
      </CasoFormProvider>
    </div>
  );
}
