"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AcquirerLogo } from "@/components/cadastros/adquirentes/acquirer-logo";
import { MarkdownView } from "@/components/docs/shared/markdown-view";
import { usePublicAcquirerDocumentation } from "@/hooks/publico/use-public-acquirer-documentation";
import type { PublicAcquirerListItem } from "@/services/public-api/list-acquirers";

interface AdquirentesDocumentacaoSheetProps {
  acquirer: PublicAcquirerListItem | null;
  onOpenChange: (open: boolean) => void;
}

function DocumentacaoSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-6 h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}

export function AdquirentesDocumentacaoSheet({
  acquirer,
  onOpenChange,
}: AdquirentesDocumentacaoSheetProps) {
  const open = acquirer != null;
  const shownRef = useRef(acquirer);
  if (acquirer) shownRef.current = acquirer;
  const shown = acquirer ?? shownRef.current;
  const query = usePublicAcquirerDocumentation(
    open ? acquirer.acquirer.id : null,
  );

  const errorMessage =
    query.error instanceof Error && query.error.message.trim()
      ? query.error.message
      : "Não foi possível carregar a documentação. Tente novamente em instantes.";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        {shown ? (
          <>
            <SheetHeader className="space-y-0 border-b border-public-border bg-muted px-6 py-4 pr-12">
              <div className="flex items-center gap-4">
                <AcquirerLogo
                  name={shown.acquirer.name}
                  logoUrl={shown.acquirer.logoUrl}
                  className="h-10 w-10 shrink-0 rounded-full border border-public-border object-cover"
                />
                <div className="min-w-0">
                  <SheetTitle>Documentação de Suporte</SheetTitle>
                  <SheetDescription className="mt-1">
                    Adquirente:{" "}
                    <span className="font-medium text-foreground">
                      {shown.acquirer.name}
                    </span>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              {open && query.isPending ? (
                <DocumentacaoSkeleton />
              ) : query.isError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
                  {errorMessage}
                </div>
              ) : query.data == null ? (
                <div className="space-y-4 text-sm leading-6 text-muted-foreground">
                  <p>
                    A documentação específica para esta adquirente ainda está
                    sendo elaborada pela Squad.
                  </p>
                  <p>
                    Para dúvidas gerais, entre em contato com o Squad
                    Experience.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-foreground">
                    {query.data.title}
                  </h2>
                  {query.data.summary ? (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {query.data.summary}
                    </p>
                  ) : null}
                  {query.data.contentMd.trim() ? (
                    <MarkdownView content={query.data.contentMd} />
                  ) : null}
                </div>
              )}
            </div>

            <SheetFooter className="border-t border-public-border bg-muted px-6 py-4">
              <SheetClose asChild>
                <Button type="button" variant="secondary">
                  Fechar
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
