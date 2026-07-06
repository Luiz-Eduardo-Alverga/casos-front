import type { ClienteTicket } from "@/interfaces/cliente-ticket";

export type OcorrenciaTipo = "atendimento-imediato" | "urgente" | "padrao";

const TIPO_ORDER: OcorrenciaTipo[] = [
  "atendimento-imediato",
  "urgente",
  "padrao",
];

const TIPO_DOT_CLASS: Record<OcorrenciaTipo, string> = {
  "atendimento-imediato": "bg-blue-500",
  urgente: "bg-red-500",
  padrao: "bg-gray-500",
};

const TIPO_LABEL: Record<OcorrenciaTipo, string> = {
  "atendimento-imediato": "Atendimento Imediato",
  urgente: "Urgente",
  padrao: "Padrão",
};

export function getOcorrenciaTipo(
  urgente: boolean,
  is: boolean,
): OcorrenciaTipo {
  if (is) return "atendimento-imediato";
  if (urgente) return "urgente";
  return "padrao";
}

export function getOcorrenciaTipoDotClass(
  urgente: boolean,
  is: boolean,
): string {
  return TIPO_DOT_CLASS[getOcorrenciaTipo(urgente, is)];
}

export function formatOcorrenciaTipoLabel(
  urgente: boolean,
  is: boolean,
): string {
  return TIPO_LABEL[getOcorrenciaTipo(urgente, is)];
}

export function getUniqueOcorrenciaTipos(
  tickets: ClienteTicket[],
): OcorrenciaTipo[] {
  const tipos = new Set<OcorrenciaTipo>();

  for (const ticket of tickets) {
    tipos.add(getOcorrenciaTipo(ticket.urgente, ticket.is));
  }

  return TIPO_ORDER.filter((tipo) => tipos.has(tipo));
}

export function getOcorrenciaTipoFromFlags(
  urgente: boolean,
  is: boolean,
): { dotClass: string; label: string; tipo: OcorrenciaTipo } {
  const tipo = getOcorrenciaTipo(urgente, is);
  return {
    tipo,
    dotClass: TIPO_DOT_CLASS[tipo],
    label: TIPO_LABEL[tipo],
  };
}
