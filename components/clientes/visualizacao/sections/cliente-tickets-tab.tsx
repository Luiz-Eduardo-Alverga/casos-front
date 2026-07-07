"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Ticket } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { Card, CardContent } from "@/components/ui/card";

import { CasoEditCardHeader } from "@/components/casos/edicao/caso-edit-card-header";

import { EmptyState } from "@/components/painel/empty-state";

import { useTicketsByCliente } from "@/hooks/tickets/use-tickets-by-cliente";

import { TicketDetalheSheet } from "./ticket-detalhe-sheet";

import { TicketItemCard } from "./ticket-item-card";

import { TicketItemCardSkeleton } from "./ticket-item-card-skeleton";

import { OcorrenciaTipoIndicator } from "./ocorrencia-status-indicator";

import { getUniqueOcorrenciaTipos } from "../ocorrencia-tipo-utils";

interface ClienteTicketsTabProps {
  registro: number;

  clienteNome: string;
}

export function ClienteTicketsTab({
  registro,

  clienteNome,
}: ClienteTicketsTabProps) {
  const [ticketSelecionado, setTicketSelecionado] = useState<number | null>(
    null,
  );

  const [detalheAberto, setDetalheAberto] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,

    fetchNextPage,

    hasNextPage,

    isFetchingNextPage,

    isLoading,

    isError,

    error,
  } = useTicketsByCliente({ registro });

  const tickets = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],

    [data],
  );

  const tipoIndicadores = useMemo(
    () => getUniqueOcorrenciaTipos(tickets),

    [tickets],
  );

  useEffect(() => {
    const el = loadMoreRef.current;

    if (!el || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },

      { root: null, rootMargin: "100px", threshold: 0 },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, tickets.length]);

  function abrirDetalhe(ticketId: number) {
    setTicketSelecionado(ticketId);

    setDetalheAberto(true);
  }

  return (
    <>
      <TicketDetalheSheet
        ticketId={ticketSelecionado}
        clienteNome={clienteNome}
        open={detalheAberto}
        onOpenChange={setDetalheAberto}
      />

      <Card className="rounded-lg bg-card shadow-card">
        <CasoEditCardHeader
          title="Ocorrências"
          icon={Ticket}
          iconClassName="text-amber-600"
          trailing={
            tipoIndicadores.length > 0 ? (
              <div className="flex flex-wrap items-center gap-4 px-1">
                {tipoIndicadores.map((tipo) => (
                  <OcorrenciaTipoIndicator key={tipo} tipo={tipo} />
                ))}
              </div>
            ) : null
          }
        />

        <CardContent className="space-y-4 p-6 pt-4">
          {isLoading ? (
            <>
              <div className="flex items-center gap-2 px-1">
                <Skeleton className="size-2 rounded-full" />

                <Skeleton className="h-4 w-24" />
              </div>

              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <TicketItemCardSkeleton key={index} />
                ))}
              </div>
            </>
          ) : isError ? (
            <p className="py-12 text-center text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Não foi possível carregar as ocorrências."}
            </p>
          ) : tickets.length === 0 ? (
            <EmptyState
              icon={Ticket}
              title="Nenhuma ocorrência encontrada"
              description="Este cliente ainda não possui ocorrências de atendimento registradas."
              className="min-h-[240px]"
            />
          ) : (
            <>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <TicketItemCard
                    key={ticket.id}
                    ticket={ticket}
                    onEditar={abrirDetalhe}
                  />
                ))}
              </div>

              {isFetchingNextPage ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <TicketItemCardSkeleton key={`loading-${index}`} />
                  ))}
                </div>
              ) : null}

              {hasNextPage && tickets.length > 0 ? (
                <div ref={loadMoreRef} className="min-h-[48px]" aria-hidden />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
