"use client";

import { ListagemPageLayout, LISTAGEM_CARD_STACK_GAP } from "@/components/layout/listagem-page-layout";

interface CadastroListSkeletonProps {
  title: string;
  description: string;
}

export function CadastroListSkeleton({
  title,
  description,
}: CadastroListSkeletonProps) {
  return (
    <ListagemPageLayout title={title} subtitle={description}>
      <div className={`bg-card shadow-card rounded-lg shrink-0 ${LISTAGEM_CARD_STACK_GAP} overflow-hidden`}>
        <div className="h-10 px-5 border-b border-border-divider bg-muted/40 animate-pulse" />
        <div className="p-6 pt-3 h-24 bg-muted/20 animate-pulse" />
      </div>
      <div className="flex-1 min-h-[240px] rounded-lg bg-card shadow-card overflow-hidden">
        <div className="h-12 px-5 border-b border-border-divider bg-muted/40 animate-pulse" />
        <div className="p-6 pt-3 min-h-[180px] bg-muted/20 animate-pulse" />
      </div>
    </ListagemPageLayout>
  );
}
