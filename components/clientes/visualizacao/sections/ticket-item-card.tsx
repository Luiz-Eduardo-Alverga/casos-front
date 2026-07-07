"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Clock, Eye, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/badges/status-badge";
import { ReportIdBadge } from "@/components/reports/report-badges";
import { formatTelefone, displayValue } from "@/components/clientes/utils";
import {
  formatTicketDate,
  formatTicketTime,
  formatTicketMotivo,
  formatTicketRetorno,
  formatTicketServicoRealizado,
} from "../ticket-utils";
import { getOcorrenciaTipoDotClass } from "../ocorrencia-tipo-utils";
import { TICKET_STATUS_BADGE_CONFIG } from "../ticket-status-config";
import type { ClienteTicket } from "@/interfaces/cliente-ticket";
import { TicketFlagBadges } from "./ticket-flag-badges";

interface TicketItemCardProps {
  ticket: ClienteTicket;
  onEditar: (ticketId: number) => void;
}

interface InfoItemProps {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

function InfoItem({ label, value, icon: Icon }: InfoItemProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-text-secondary">{label}</span>
      <div className="flex items-center gap-1.5">
        {Icon ? (
          <Icon className="h-3 w-3 shrink-0 text-text-secondary" />
        ) : null}
        <span className="truncate text-sm font-medium text-text-primary">
          {value}
        </span>
      </div>
    </div>
  );
}

export function TicketItemCard({ ticket, onEditar }: TicketItemCardProps) {
  const servicoRealizado = formatTicketServicoRealizado(
    ticket.servicoRealizado,
  );
  const servicoVazio = servicoRealizado === "Ainda não registrado";
  const motivo = formatTicketMotivo(ticket.motivo);
  const retornoFormatado = formatTicketRetorno(ticket.retorno);

  const motivoRef = useRef<HTMLParagraphElement>(null);
  const [motivoExpanded, setMotivoExpanded] = useState(false);
  const [motivoClamped, setMotivoClamped] = useState(false);

  useLayoutEffect(() => {
    const el = motivoRef.current;
    if (!el || motivoExpanded || motivo === "—") return;
    setMotivoClamped(el.scrollHeight > el.clientHeight + 1);
  }, [motivoExpanded, motivo]);

  return (
    <article className="relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border-divider bg-card shadow-card">
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          getOcorrenciaTipoDotClass(ticket.urgente, ticket.is),
        )}
        aria-hidden
      />

      <div className="flex flex-col gap-3 p-5 pl-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <ReportIdBadge id={ticket.id} />
            {ticket.status ? (
              <StatusBadge
                status={ticket.status}
                config={TICKET_STATUS_BADGE_CONFIG}
              />
            ) : null}
            <TicketFlagBadges urgente={ticket.urgente} is={ticket.is} />
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
              <Clock className="h-3 w-3 shrink-0" />
              <span className="text-xs">
                Aberto em {formatTicketDate(ticket.data)}
              </span>
            </span>
          </div>
        </div>

        {motivo !== "—" ? (
          <div className="flex flex-col items-start gap-1">
            <p
              ref={motivoRef}
              className={cn(
                "text-sm text-text-secondary",
                !motivoExpanded && "line-clamp-2",
              )}
            >
              <span className="font-medium text-text-primary">Motivo: </span>
              {motivo}
            </p>
            {motivoClamped || motivoExpanded ? (
              <button
                type="button"
                onClick={() => setMotivoExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs font-medium text-text-primary hover:underline"
              >
                {motivoExpanded ? (
                  <>
                    Ver menos
                    <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Ver mais
                    <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border-divider bg-muted/30 p-3 sm:grid-cols-4">
          <InfoItem label="Aberto por" value={displayValue(ticket.atendente)} />
          <InfoItem
            label="Responsável pelo suporte"
            value={displayValue(ticket.suporteNome)}
          />
          <InfoItem
            label="Solicitado por"
            value={displayValue(ticket.solicitadoPor)}
          />
          <InfoItem
            label="Telefone"
            value={formatTelefone(ticket.telefone)}
            icon={Phone}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border-divider bg-muted/30 p-3 sm:grid-cols-4">
          <InfoItem label="Retorno" value={retornoFormatado} />
          <InfoItem
            label="Hora marcada"
            value={formatTicketTime(ticket.horaMarcada)}
          />
          <InfoItem
            label="Chegada"
            value={formatTicketTime(ticket.horaChegada)}
          />
          <InfoItem label="Saída" value={formatTicketTime(ticket.horaSaida)} />
        </div>

        {!servicoVazio ? (
          <p className="text-sm text-text-secondary">
            <span className="font-medium text-text-primary">
              Serviço realizado:{" "}
            </span>
            {servicoRealizado}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="ml-auto"
            onClick={() => onEditar(ticket.id)}
          >
            <Eye className="h-3.5 w-3.5" />
            Visualizar ocorrência
          </Button>
        </div>
      </div>
    </article>
  );
}
