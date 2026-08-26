"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { FileText, Settings, Tag, Link2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormSetor } from "@/components/fields";
import { useDoc } from "@/hooks/docs/use-doc";
import { useDocCategories } from "@/hooks/docs/use-doc-categories";
import { useCreateDoc } from "@/hooks/docs/use-create-doc";
import { useUpdateDoc } from "@/hooks/docs/use-update-doc";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { useDbAppUsers } from "@/hooks/configuracoes/use-db-app-users";
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
  const users = useDbAppUsers();
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
    const payload = {
      ...buildDocPayload(values, selectedSector),
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
        <form
          className="flex flex-1 flex-col px-6 pb-24 pt-20"
          onSubmit={handleSubmit((values) => save(values))}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {mode === "edit" ? "Editar documento" : "Novo documento"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Organize o conhecimento técnico e de processo do time.
            </p>
          </div>
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
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {(categories.data ?? []).map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.categoryId ? (
                        <p className="text-xs text-destructive">
                          {errors.categoryId.message}
                        </p>
                      ) : null}
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rascunho">Rascunho</SelectItem>
                          <SelectItem value="publicado">Publicado</SelectItem>
                          <SelectItem value="desatualizado">
                            Desatualizado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
                <CasoFormSetor />
                <Controller
                  control={control}
                  name="ownerUserId"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label>Responsável</Label>
                      <Select
                        value={field.value || "__none__"}
                        onValueChange={(value) =>
                          field.onChange(value === "__none__" ? "" : value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">
                            Sem responsável
                          </SelectItem>
                          {(users.data ?? []).map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              </FormCard>
              <FormCard title="Tags" icon={Tag}>
                <TagsField />
              </FormCard>
              <FormCard title="Vínculos" icon={Link2}>
                <LinksField />
              </FormCard>
              <FormCard title="Revisão" icon={CalendarDays}>
                <div className="space-y-2">
                  <Label htmlFor="review-due-at">Revisar até</Label>
                  <Input
                    id="review-due-at"
                    type="date"
                    {...register("reviewDueAt")}
                  />
                  <p className="text-xs text-muted-foreground">
                    O documento será marcado como desatualizado após esta data
                  </p>
                </div>
              </FormCard>
            </aside>
          </div>

          <footer className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-border-divider bg-card px-6 py-4 shadow-lg md:left-16 lg:left-64">
            <Button type="button" variant="ghost" onClick={cancel}>
              Cancelar
            </Button>
            {mode === "create" ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={handleSubmit((values) => save(values, "rascunho"))}
                >
                  Salvar rascunho
                </Button>
                <Button
                  type="button"
                  disabled={pending}
                  onClick={handleSubmit((values) => save(values, "publicado"))}
                >
                  Publicar
                </Button>
              </div>
            ) : (
              <Button type="submit" disabled={pending}>
                Salvar alterações
              </Button>
            )}
          </footer>
        </form>
      </CasoFormProvider>
    </FormProvider>
  );
}
