"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Box,
  Building2,
  FileText,
  Link2,
  MoreHorizontal,
  Pencil,
  Tag,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { useDoc } from "@/hooks/docs/use-doc";
import { useDocActivity } from "@/hooks/docs/use-doc-activity";
import { useDeleteDoc } from "@/hooks/docs/use-delete-doc";
import { useUpdateDoc } from "@/hooks/docs/use-update-doc";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import { isHttpError } from "@/lib/http-error";
import { DocCategoriaBadge } from "../lista/doc-categoria-badge";
import { DocStatusBadge } from "../lista/doc-status-badge";
import { MarkdownView } from "../shared/markdown-view";
import { DocDetalheSkeleton } from "./doc-detalhe-skeleton";
import type { Doc, DocLink } from "@/services/db-api/docs";

const activityLabels = {
  created: "Criado",
  updated: "Atualizado",
  published: "Publicado",
  archived: "Marcado como desatualizado",
} as const;

function formatDate(value: string | null, withTime = false) {
  if (!value) return "—";
  return format(new Date(value), withTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy", {
    locale: ptBR,
  });
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function linkHref(link: DocLink) {
  if (link.entityType === "case") return `/casos/${link.entityId}`;
  if (link.entityType === "client") return `/clientes/${link.entityId}`;
  if (link.entityType === "product") {
    return `/casos?produto=${encodeURIComponent(link.entityId)}`;
  }
  return `/cadastros/adquirentes?search=${encodeURIComponent(link.entityLabel)}`;
}

function linkIcon(link: DocLink) {
  if (link.entityType === "case") return FileText;
  if (link.entityType === "client") return Building2;
  if (link.entityType === "product") return Box;
  return BookOpen;
}

function InfoCard({
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
      <CardContent className="px-6 pb-6 pt-2">{children}</CardContent>
    </Card>
  );
}

function Ficha({ doc }: { doc: Doc }) {
  const rows = [
    ["Categoria", doc.category.name],
    ["Status", doc.status],
    ["Setor", doc.sector ?? "—"],
    ["Criado em", formatDate(doc.createdAt)],
    ["Atualizado em", formatDate(doc.updatedAt)],
    ["Revisar até", formatDate(doc.reviewDueAt)],
  ];
  return (
    <div className="space-y-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-start justify-between gap-4 text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="text-right font-medium capitalize">{value}</span>
        </div>
      ))}
      <div className="flex items-center justify-between gap-4 pt-2 text-sm">
        <span className="text-muted-foreground">Responsável</span>
        {doc.owner ? (
          <span className="flex items-center gap-2 font-medium">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {initials(doc.owner.nome)}
              </AvatarFallback>
            </Avatar>
            {doc.owner.nome}
          </span>
        ) : (
          <span>—</span>
        )}
      </div>
    </div>
  );
}

export function DocDetalhe({ docId }: { docId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("documento");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { data: doc, isLoading, error } = useDoc(docId);
  const activity = useDocActivity(docId, activeTab === "historico");
  const deleteDoc = useDeleteDoc();
  const updateDoc = useUpdateDoc(docId);
  const rbacReady = permissionsLoaded();
  const canEdit = !rbacReady || hasPermission("edit-doc");
  const canDelete = !rbacReady || hasPermission("delete-doc");
  const canCreate = !rbacReady || hasPermission("create-doc");

  if (isLoading) return <DocDetalheSkeleton />;
  if (isHttpError(error) && error.status === 404) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pt-20 text-center">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Documento não encontrado</h1>
        <p className="text-sm text-muted-foreground">
          O documento não existe, foi excluído ou você não pode visualizá-lo.
        </p>
        <Button asChild>
          <Link href="/documentacao">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Documentação
          </Link>
        </Button>
      </div>
    );
  }
  if (!doc) return null;

  const handleDelete = async () => {
    await deleteDoc.mutateAsync(doc.id);
    router.push("/documentacao");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 px-6 pb-10 pt-20">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/documentacao" aria-label="Voltar">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl font-bold text-foreground">{doc.title}</h1>
            <div className="flex flex-wrap gap-2">
              <DocCategoriaBadge name={doc.category.name} />
              <DocStatusBadge status={doc.status} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit ? (
            <Button variant="outline" asChild>
              <Link href={`/documentacao/${doc.id}/editar`}>
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
            </Button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Mais ações">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canCreate ? (
                <DropdownMenuItem
                  onSelect={() =>
                    router.push(`/documentacao/novo?duplicar=${doc.id}`)
                  }
                >
                  Duplicar
                </DropdownMenuItem>
              ) : null}
              {canEdit ? (
                <DropdownMenuItem
                  disabled={
                    doc.status === "desatualizado" || updateDoc.isPending
                  }
                  onSelect={() =>
                    updateDoc.mutate({ status: "desatualizado" })
                  }
                >
                  Marcar como desatualizado
                </DropdownMenuItem>
              ) : null}
              {canDelete ? (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-h-0 rounded-lg bg-card shadow-card">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full min-h-0 flex-col"
          >
            <CardHeader className="border-b border-border-divider p-4 pb-2">
              <TabsList>
                <TabsTrigger value="documento">Documento</TabsTrigger>
                <TabsTrigger value="anexos">Anexos</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2">
              <TabsContent value="documento" className="mt-0 space-y-6">
                {doc.summary ? (
                  <p className="rounded-lg bg-muted p-4 text-sm font-medium leading-6">
                    {doc.summary}
                  </p>
                ) : null}
                <MarkdownView content={doc.contentMd} />
              </TabsContent>
              <TabsContent value="anexos" className="mt-0">
                <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-semibold">
                    Anexos de documentação
                  </p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    TODO: adaptar o endpoint de anexos de casos para documentos
                    antes de habilitar upload.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="historico" className="mt-0">
                {activity.isLoading ? (
                  <div className="py-8 text-sm text-muted-foreground">
                    Carregando histórico...
                  </div>
                ) : activity.data?.length ? (
                  <div className="space-y-0">
                    {activity.data.map((item) => (
                      <div
                        key={item.id}
                        className="relative border-l border-border-divider pb-6 pl-6 last:pb-0"
                      >
                        <span className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-primary" />
                        <p className="text-sm">
                          {activityLabels[item.action]} por{" "}
                          <strong>{item.userName}</strong>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.createdAt, true)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-sm text-muted-foreground">
                    Nenhuma atividade registrada.
                  </p>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <aside className="space-y-2">
          <InfoCard title="Ficha" icon={FileText}>
            <Ficha doc={doc} />
          </InfoCard>
          <InfoCard title="Tags" icon={Tag}>
            {doc.tags.length ? (
              <div className="flex flex-wrap gap-2">
                {doc.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/documentacao?tag=${encodeURIComponent(tag)}`}
                    className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem tags.</p>
            )}
          </InfoCard>
          <InfoCard title="Vínculos" icon={Link2}>
            {doc.links.length ? (
              <div className="space-y-2">
                {doc.links.map((link) => {
                  const Icon = linkIcon(link);
                  return (
                    <Link
                      key={`${link.entityType}:${link.entityId}`}
                      href={linkHref(link)}
                      className="flex items-center gap-2 text-sm font-medium hover:underline"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {link.entityLabel}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem vínculos.</p>
            )}
          </InfoCard>
        </aside>
      </div>

      <ConfirmacaoModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        titulo="Excluir documento?"
        descricao="Esta ação é permanente e também remove tags, vínculos e histórico associados."
        confirmarLabel="Excluir"
        variant="danger"
        isLoading={deleteDoc.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
