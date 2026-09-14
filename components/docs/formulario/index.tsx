"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CalendarDays,
  CircleDot,
  FileText,
  Folder,
  Link2,
  Settings,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import {
  CasoFormSetor,
  CasoFormUsuarioAbertura,
} from "@/components/fields";
import { useDoc } from "@/hooks/docs/use-doc";
import { useDocCategories } from "@/hooks/docs/use-doc-categories";
import { useCreateDoc } from "@/hooks/docs/use-create-doc";
import { useUpdateDoc } from "@/hooks/docs/use-update-doc";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { useDbAppUsersInfinite } from "@/hooks/configuracoes/use-db-app-users";
import { DocDetalheSkeleton } from "../detalhe/doc-detalhe-skeleton";
import { MarkdownEditor } from "./markdown-editor";
import { TagsField } from "./tags-field";
import { LinksField } from "./links-field";
import { buildDocPayload } from "./shared/payload";
import { docFormSchema, type DocFormValues } from "./schema";

const defaultValues: DocFormValues = {
  title: "",
  summary: "",
  contentMd: "",
  categoryId: "",
  status: "rascunho",
  sector: "",
  ownerUserId: "",
  ownerLegacyUserId: "",
  reviewDueAt: "",
  tags: [],
  links: [],
};

function FormCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof FileText;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardHeader className="border-b border-border-divider p-4 pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6 pt-2">
        {children}
      </CardContent>
    </Card>
  );
}

export function DocForm({
  mode,
  docId,
  duplicateId,
}: {
  mode: "create" | "edit";
  docId?: string;
  duplicateId?: string | null;
}) {
  const router = useRouter();
  const sourceId = mode === "edit" ? docId : duplicateId;
  const source = useDoc(sourceId);
  const categories = useDocCategories();
  const sectors = useSetores();
  const users = useDbAppUsersInfinite();
  const createDoc = useCreateDoc();
  const updateDoc = useUpdateDoc(docId ?? "");
  const methods = useForm<DocFormValues>({
    resolver: zodResolver(docFormSchema),
    defaultValues,
  });
  const {
    register,
    control,
    watch,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = methods;
  const summary = watch("summary");
  const appUsers = useMemo(
    () => users.data?.pages.flatMap((page) => page.items) ?? [],
    [users.data],
  );

  useEffect(() => {
    if (users.hasNextPage && !users.isFetchingNextPage) {
      void users.fetchNextPage();
    }
  }, [
    users.fetchNextPage,
    users.hasNextPage,
    users.isFetchingNextPage,
  ]);

  useEffect(() => {
    if (!source.data) return;
    const sectorId = sectors.data?.find(
      (item) => item.nome === source.data?.sector,
    )?.id;
    reset({
      title: mode === "create" ? `${source.data.title} (cópia)` : source.data.title,
      summary: source.data.summary ?? "",
      contentMd: source.data.contentMd,
      categoryId: source.data.categoryId,
      status: mode === "create" ? "rascunho" : source.data.status,
      sector: sectorId ? String(sectorId) : "",
      ownerUserId: source.data.ownerUserId ?? "",
      ownerLegacyUserId: source.data.owner?.legacyUserId
        ? String(source.data.owner.legacyUserId)
        : "",
      reviewDueAt: source.data.reviewDueAt ?? "",
      tags: source.data.tags,
      links: source.data.links.map((link) => ({
        entityType: link.entityType,
        entityId: link.entityId,
        entityLabel: link.entityLabel,
      })),
    });
  }, [mode, reset, sectors.data, source.data]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isDirty]);

  const contextValue = useMemo(
    () => ({
      form: methods,
      importanceOptions: [],
      isDisabled: false,
      lazyLoadComboboxOptions: false,
    }),
    [methods],
  );

  const save = async (
    values: DocFormValues,
    status?: "rascunho" | "publicado",
  ) => {
    const selectedSector = sectors.data?.find(
      (item) => String(item.id) === values.sector,
    )?.nome;
    const selectedOwner = values.ownerLegacyUserId
      ? appUsers.find(
          (user) =>
            String(user.legacyUserId) === values.ownerLegacyUserId,
        )
      : undefined;
    if (values.ownerLegacyUserId && !selectedOwner) {
      toast.error(
        "O responsável selecionado ainda não está sincronizado no Softflow.",
      );
      return;
    }
    const payload = {
      ...buildDocPayload(
        {
          ...values,
          ownerUserId: selectedOwner?.id ?? values.ownerUserId,
        },
        selectedSector,
      ),
      ...(status ? { status } : {}),
    };
    const result =
      mode === "edit"
        ? await updateDoc.mutateAsync(payload)
        : await createDoc.mutateAsync(payload);
    reset(values);
    router.push(`/documentacao/${result.id}`);
  };

  const cancel = () => {
    if (
      isDirty &&
      !window.confirm("Descartar as alterações não salvas?")
    ) {
      return;
    }
    router.push(
      mode === "edit" && docId
        ? `/documentacao/${docId}`
        : "/documentacao",
    );
  };

  if (sourceId && source.isLoading) return <DocDetalheSkeleton />;

  const pending = createDoc.isPending || updateDoc.isPending;

  return (
    <FormProvider {...methods}>
      <CasoFormProvider value={contextValue}>
        <ListagemPageLayout
          title={mode === "edit" ? "Editar documento" : "Novo documento"}
          subtitle="Organize o conhecimento técnico e de processo do time."
          className="flex-1 overflow-auto pb-12"
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full px-4 sm:w-auto"
                onClick={cancel}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              {mode === "create" ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={handleSubmit((values) =>
                      save(values, "rascunho"),
                    )}
                  >
                    Salvar rascunho
                  </Button>
                  <Button
                    type="button"
                    disabled={pending}
                    onClick={handleSubmit((values) =>
                      save(values, "publicado"),
                    )}
                  >
                    Publicar
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  disabled={pending}
                  onClick={handleSubmit((values) => save(values))}
                >
                  Salvar alterações
                </Button>
              )}
            </>
          }
        >
          <form onSubmit={handleSubmit((values) => save(values))}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <main className="space-y-2">
              <FormCard title="Documento" icon={FileText}>
                <div className="space-y-2">
                  <Label htmlFor="doc-title">Título</Label>
                  <Input
                    id="doc-title"
                    className="h-12 text-base font-semibold"
                    {...register("title")}
                  />
                  {errors.title ? (
                    <p className="text-xs text-destructive">
                      {errors.title.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between gap-2">
                    <Label htmlFor="doc-summary">Resumo</Label>
                    <span className="text-xs text-muted-foreground">
                      {summary.length}/400
                    </span>
                  </div>
                  <Textarea
                    id="doc-summary"
                    rows={2}
                    maxLength={400}
                    {...register("summary")}
                  />
                </div>
              </FormCard>
              <FormCard title="Conteúdo" icon={FileText}>
                <MarkdownEditor />
              </FormCard>
            </main>
            <aside className="space-y-2">
              <FormCard title="Classificação" icon={Settings}>
                <ComboboxField
                  name="categoryId"
                  label="Categoria"
                  icon={Folder}
                  options={(categories.data ?? []).map((category) => ({
                    value: category.id,
                    label: category.name,
                  }))}
                  placeholder="Selecione a categoria..."
                  emptyText="Nenhuma categoria encontrada."
                  isLoading={categories.isLoading}
                  required
                />
                <ComboboxField
                  name="status"
                  label="Status"
                  icon={CircleDot}
                  options={[
                    { value: "rascunho", label: "Rascunho" },
                    { value: "publicado", label: "Publicado" },
                    { value: "desatualizado", label: "Desatualizado" },
                  ]}
                  placeholder="Selecione o status..."
                  emptyText="Nenhum status encontrado."
                  required
                />
                <CasoFormSetor />
                <CasoFormUsuarioAbertura
                  name="ownerLegacyUserId"
                  label="Responsável"
                  placeholder="Selecione o responsável..."
                  required={false}
                />
              </FormCard>
              <FormCard title="Tags" icon={Tag}>
                <TagsField />
              </FormCard>
              <FormCard title="Vínculos" icon={Link2}>
                <LinksField />
              </FormCard>
              <FormCard title="Revisão" icon={CalendarDays}>
                <Controller
                  control={control}
                  name="reviewDueAt"
                  render={({ field }) => (
                    <DatePickerInput
                      id="review-due-at"
                      label="Revisar até"
                      value={
                        field.value
                          ? new Date(`${field.value}T00:00:00`)
                          : undefined
                      }
                      onChange={(date) =>
                        field.onChange(
                          date
                            ? `${date.getFullYear()}-${String(
                                date.getMonth() + 1,
                              ).padStart(2, "0")}-${String(
                                date.getDate(),
                              ).padStart(2, "0")}`
                            : "",
                        )
                      }
                    />
                  )}
                />
                <div>
                  <p className="text-xs text-muted-foreground">
                    O documento será marcado como desatualizado após esta data
                  </p>
                </div>
              </FormCard>
            </aside>
          </div>
          </form>
        </ListagemPageLayout>
      </CasoFormProvider>
    </FormProvider>
  );
}
