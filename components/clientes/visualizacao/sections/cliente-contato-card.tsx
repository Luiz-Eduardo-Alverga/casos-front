"use client";

import { Mail, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "@/components/casos/edicao/caso-edit-card-header";
import { ClienteDetailField } from "../cliente-detail-field";
import {
  displayValue,
  formatTelefone,
  parseEmails,
  parseTelefoneResidencial,
} from "@/components/clientes/utils";
import type { ClienteDetalhe } from "@/services/clientes/get-cliente-by-id";

interface ClienteContatoCardProps {
  cliente: ClienteDetalhe;
}

export function ClienteContatoCard({ cliente }: ClienteContatoCardProps) {
  const emails = parseEmails(cliente.email);
  const telefoneResidencial = parseTelefoneResidencial(cliente.fone_resid);
  const telefoneResidencialFormatado = formatTelefone(
    telefoneResidencial.numero,
  );
  const telefoneComercialFormatado = formatTelefone(cliente.fone_com);

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CasoEditCardHeader
        title="Contato"
        icon={MessageSquare}
        iconClassName="text-violet-600"
      />
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-start p-6 pt-4">
        <ClienteDetailField
          label="E-mails"
          value={
            emails.length > 0 ? (
              <ul className="space-y-2">
                {emails.map((email) => (
                  <li key={email} className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <a
                      href={`mailto:${email}`}
                      className="break-all text-sm font-semibold text-text-primary hover:underline"
                    >
                      {email}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              displayValue(null)
            )
          }
        />

        <div className="space-y-4">
          <ClienteDetailField
            label="Telefone residencial"
            value={
              telefoneResidencial.numero ? (
                <span>
                  {telefoneResidencialFormatado}
                  {telefoneResidencial.contato ? (
                    <span className="ml-2 font-normal text-text-secondary">
                      {telefoneResidencial.contato}
                    </span>
                  ) : null}
                </span>
              ) : (
                displayValue(null)
              )
            }
          />
          <ClienteDetailField
            label="Telefone comercial"
            value={telefoneComercialFormatado}
          />
        </div>
      </CardContent>
    </Card>
  );
}
