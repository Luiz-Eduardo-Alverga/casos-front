export interface TicketDetalhe {
  id: number;
  clienteId: number;
  clienteNome: string;
  motivo: string;
  data: string;
  retorno: string;
  hora: string;
  tipoAtendimento: string;
  solicitadoPor: string;
  telefone: string;
  atendente: string;
  suporteId: number;
  suporteNome: string;
  usuarioPartnerId: number | null;
  assunto: string | null;
  faqId: number;
  faqGrupo: string;
  servicoRealizado: string;
  horaChegada: string;
  horaSaida: string;
  horaMarcada: string | null;
  urgente: boolean;
  is: boolean;
  ticket: number;
  valeu: number;
  valeuNome: string | null;
  finalizado: boolean;
  status: string;
  alteracaoUsuario: string;
  alteracaoDataHora: string;
  latitude?: string | null;
  longitude?: string | null;
  latitudeCheckout?: string | null;
  longitudeCheckout?: string | null;
}

/** Payload para criar ticket na Softcom Cloud (POST /tickets). */
export interface CreateTicketRequest {
  clienteId: number;
  motivo: string;
  tipoAtendimento?: string;
  solicitadoPor?: string;
  telefone?: string;
  atendente?: string;
  suporteId?: number;
  faqId?: number;
  faqGrupo?: string;
  assunto?: string;
  data?: string;
  retorno?: string;
  horaMarcada?: string | null;
  ticket?: number;
  is?: boolean;
  urgente?: boolean;
  valeu?: number;
  usuarioPartnerId?: number;
  latitude?: string;
  longitude?: string;
  latitudeCheckout?: string;
  longitudeCheckout?: string;
}

/** Item resumido retornado na listagem por cliente. */
export type ClienteTicket = TicketDetalhe;

export interface ClienteTicketsPagination {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

export interface GetClienteTicketsResponse {
  data: ClienteTicket[];
  pagination: ClienteTicketsPagination;
}
