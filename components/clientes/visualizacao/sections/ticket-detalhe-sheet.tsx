"use client";

import type { ReactNode } from "react";
import {
  CircleCheck,
  Clock,
  FileText,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/badges/status-badge";
import { ClienteDetailField } from "../cliente-detail-field";
import { displayValue, formatTelefone } from "@/components/clientes/utils";
import {
  formatTicketDate,
  formatTicketDateTime,
  formatTicketTime,
  formatTicketMotivo,
  formatTicketRetorno,
  formatTicketServicoRealizado,
  formatTicketUrgencia,
} from "../ticket-utils";
import { TICKET_STATUS_BADGE_CONFIG } from "../ticket-status-config";
import { TicketFlagBadges } from "./ticket-flag-badges";
import { useTicketById } from "@/hooks/tickets/use-ticket-by-id";
import type { TicketDetalhe } from "@/interfaces/cliente-ticket";
import { cn } from "@/lib/utils";

interface TicketDetalheSheetProps {
  ticketId: number | null;
  clienteNome?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TicketSheetSectionProps {
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
  children: ReactNode;
}

function TicketSheetSection({
  title,
  icon: Icon,
  iconClassName = "text-text-primary",
  children,
}: TicketSheetSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border-divider pb-2">
        <Icon className={cn("h-4 w-4 shrink-0", iconClassName)} />
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function TicketDetalheSheetSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TicketDetalheContent({
  ticket,
  clienteNome,
}: {
  ticket: TicketDetalhe;
  clienteNome?: string;
}) {
  const servicoRealizado = formatTicketServicoRealizado(
    ticket.servicoRealizado,
  );
  const servicoVazio = servicoRealizado === "Ainda não registrado";
  const tituloCliente = clienteNome?.trim() || ticket.clienteNome;

  return (
    <>
      <div className="shrink-0 border-b border-border-divider px-6 pb-4 pt-6 pr-12">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Visualizar ocorrência · {tituloCliente}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-bold text-text-primary">#{ticket.id}</h2>
          {ticket.status ? (
            <StatusBadge
              status={ticket.status}
              config={TICKET_STATUS_BADGE_CONFIG}
            />
          ) : null}
          <TicketFlagBadges urgente={ticket.urgente} is={ticket.is} />
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        <TicketSheetSection
          title="Atendimento"
          icon={UserRound}
          iconClassName="text-sky-600"
        >
          <ClienteDetailField
            label="Motivo"
            value={
              <span className="font-medium text-text-primary">
                {formatTicketMotivo(ticket.motivo)}
              </span>
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ClienteDetailField
              label="Atendente"
              value={displayValue(ticket.atendente)}
            />

            <ClienteDetailField
              label="Suporte"
              value={displayValue(ticket.suporteNome)}
            />

            <ClienteDetailField
              label="Solicitado por"
              value={displayValue(ticket.solicitadoPor)}
            />
            <ClienteDetailField
              label="Telefone"
              value={formatTelefone(ticket.telefone)}
            />
          </div>
        </TicketSheetSection>

        <TicketSheetSection
          title="Status"
          icon={CircleCheck}
          iconClassName="text-emerald-600"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ClienteDetailField
              label="Status da ocorrência"
              value={
                ticket.status ? (
                  <StatusBadge
                    status={ticket.status}
                    config={TICKET_STATUS_BADGE_CONFIG}
                  />
                ) : (
                  displayValue(null)
                )
              }
            />
            <ClienteDetailField
              label="Urgência"
              value={formatTicketUrgencia(ticket.urgente, ticket.is)}
            />
          </div>
        </TicketSheetSection>

        <TicketSheetSection
          title="Serviço realizado"
          icon={FileText}
          iconClassName="text-violet-600"
        >
          <ClienteDetailField
            label="Descrição do serviço"
            value={
              <span
                className={
                  servicoVazio
                    ? "font-medium text-muted-foreground"
                    : "whitespace-pre-wrap font-medium text-text-secondary"
                }
              >
                {servicoRealizado}
              </span>
            }
          />
        </TicketSheetSection>

        <TicketSheetSection
          title="Linha do tempo (somente leitura)"
          icon={Clock}
          iconClassName="text-amber-600"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ClienteDetailField
              label="Data do chamado"
              value={formatTicketDate(ticket.data)}
            />
            <ClienteDetailField
              label="Hora marcada"
              value={formatTicketTime(ticket.horaMarcada)}
            />
            <ClienteDetailField
              label="Chegada"
              value={formatTicketTime(ticket.horaChegada)}
            />
            <ClienteDetailField
              label="Saída"
              value={formatTicketTime(ticket.horaSaida)}
            />

            <ClienteDetailField
              label="FAQ / Grupo"
              value={displayValue(ticket.faqGrupo)}
              className="sm:col-span-2"
            />
            <ClienteDetailField
              label="Última alteração"
              value={
                ticket.alteracaoUsuario
                  ? `${ticket.alteracaoUsuario} em ${formatTicketDateTime(ticket.alteracaoDataHora)}`
                  : displayValue(null)
              }
              className="sm:col-span-2"
            />
          </div>
        </TicketSheetSection>
      </div>
    </>
  );
}

export function TicketDetalheSheet({
  ticketId,
  clienteNome,
  open,
  onOpenChange,
}: TicketDetalheSheetProps) {
  const { data, isLoading, isError, error } = useTicketById(ticketId, {
    enabled: open,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl md:max-w-2xl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>
            {ticketId
              ? `Visualizar ocorrência #${ticketId}`
              : "Visualizar ocorrência"}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <>
            <div className="shrink-0 border-b border-border-divider px-6 pb-4 pt-6 pr-12">
              <Skeleton className="h-3 w-56" />
              <Skeleton className="mt-3 h-8 w-40" />
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <TicketDetalheSheetSkeleton />
            </div>
          </>
        ) : isError ? (
          <div className="flex flex-1 flex-col px-6 py-12">
            <p className="text-center text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Não foi possível carregar os detalhes da ocorrência."}
            </p>
          </div>
        ) : data ? (
          <TicketDetalheContent ticket={data} clienteNome={clienteNome} />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
