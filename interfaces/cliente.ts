export interface Cliente {
  id: number;
  nome: string;
  razaoSocial: string;
  cpf: string;
  cnpj: string;
  cidade: string;
  uf: string;
  cep: string;
  bairro: string;
  endereco: string;
  foneResidencial: string;
  foneComercial: string;
  email: string;
  empresa: string;
  dataCadastro: string;
  desativado: boolean;
  bloqueado?: boolean;
  partnerId: number;
}

export interface ClientesPagination {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

export interface GetClientesResponse {
  data: Cliente[];
  pagination: ClientesPagination;
}
