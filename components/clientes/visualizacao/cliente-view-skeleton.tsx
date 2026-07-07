"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "@/components/casos/edicao/caso-edit-card-header";
import { FileText, MapPin, MessageSquare } from "lucide-react";
import { CARD_HEADER_PRESETS } from "@/lib/casos/card-header-theme";
import { cn } from "@/lib/utils";

function DetailFieldSkeleton({ labelWidth = "w-24" }: { labelWidth?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Skeleton className={cn("h-3", labelWidth)} />
      <Skeleton className="h-4 w-full max-w-[180px]" />
    </div>
  );
}

function ClienteViewHeaderSkeleton() {
  return (
    <div className="flex shrink-0 items-center justify-between gap-4">
      <div
        className={cn(
          "inline-flex h-9 w-auto shrink-0 flex-nowrap items-center justify-start gap-0 overflow-x-auto rounded-full bg-card p-1 text-muted-foreground shadow-sm",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        <div className="flex shrink-0 items-center rounded-full px-3 py-1.5">
          <Skeleton className="h-4 w-10 rounded-full" />
        </div>
        <div className="flex shrink-0 items-center rounded-full px-3 py-1.5">
          <Skeleton className="h-4 w-[5.5rem] rounded-full" />
        </div>
      </div>

      <Skeleton className="h-9 w-[5.75rem] shrink-0 rounded-md" />
    </div>
  );
}

function DadosGeraisCardSkeleton() {
  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CasoEditCardHeader
        title="Dados gerais"
        icon={FileText}
        iconClassName="text-sky-600"
      />
      <CardContent className="space-y-4 p-6 pt-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailFieldSkeleton labelWidth="w-28" />
          <DetailFieldSkeleton labelWidth="w-24" />
          <DetailFieldSkeleton labelWidth="w-20" />
          <DetailFieldSkeleton labelWidth="w-10" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailFieldSkeleton labelWidth="w-16" />
          <DetailFieldSkeleton labelWidth="w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

function ContatoCardSkeleton() {
  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CasoEditCardHeader
        title="Contato"
        icon={MessageSquare}
        iconClassName="text-violet-600"
      />
      <CardContent className="grid grid-cols-1 items-start gap-4 p-6 pt-4 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1">
          <Skeleton className="h-3 w-14" />
          <div className="space-y-2 pt-0.5">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-3.5 shrink-0 rounded" />
                <Skeleton className="h-4 w-full max-w-[220px]" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <DetailFieldSkeleton labelWidth="w-32" />
          <DetailFieldSkeleton labelWidth="w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

function EnderecoCardSkeleton() {
  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CasoEditCardHeader
        title="Endereço"
        icon={MapPin}
        iconClassName="text-orange-600"
      />
      <CardContent className="space-y-4 p-6 pt-2">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailFieldSkeleton labelWidth="w-20" />
            <DetailFieldSkeleton labelWidth="w-14" />
            <DetailFieldSkeleton labelWidth="w-20" />
            <DetailFieldSkeleton labelWidth="w-8" />
          </div>

          <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

function ProdutoUrlItemSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-divider bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-4 w-36 max-w-full" />
          <Skeleton className="h-3.5 w-52 max-w-full" />
        </div>
      </div>

      <div className="shrink-0 space-y-1.5 text-right sm:max-w-[240px]">
        <Skeleton className="ml-auto h-3 w-28" />
        <Skeleton className="ml-auto h-4 w-44 max-w-full" />
      </div>
    </div>
  );
}

function ProdutosUrlsCardSkeleton() {
  const produtosPreset = CARD_HEADER_PRESETS.clientes;

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CasoEditCardHeader
        title="Produtos / URLs de acesso"
        icon={produtosPreset.icon}
        iconClassName={produtosPreset.iconClassName}
      />
      <CardContent className="space-y-2 p-6 pt-2">
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <ProdutoUrlItemSkeleton key={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ClienteViewSkeleton() {
  return (
    <div
      className="flex flex-1 flex-col lg:min-h-0 lg:overflow-hidden"
      role="status"
      aria-busy="true"
      aria-label="Carregando dados do cliente"
    >
      <ClienteViewHeaderSkeleton />

      <div className="mt-3 min-h-0 flex-1 overflow-auto pb-12">
        <div className="flex min-w-0 flex-col gap-2">
          <DadosGeraisCardSkeleton />
          <ContatoCardSkeleton />
          <EnderecoCardSkeleton />
          <ProdutosUrlsCardSkeleton />
        </div>
      </div>
    </div>
  );
}
