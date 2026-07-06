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
