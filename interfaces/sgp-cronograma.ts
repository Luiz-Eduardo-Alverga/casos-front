/** Item retornado por GET /sgp-cronograma/projeto/{registro} */
export interface SgpCronogramaItem {
  sequencia: number;
  registro: number;
  datas: string | null;
  dias: number;
  id_tipo: number;
  observacao: string | null;
  horas: number;
  concluido: boolean;
  objetivo_quem: string | null;
  hora_prevista: string | null;
  data_inicio: string | null;
  data_termino: string | null;
  hora_realizada: string | null;
  id_papel: number;
  nao_gerar_ocorrencia: number;
}

export interface SgpCronogramaPagination {
  per_page: number;
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
}

/** Resposta GET /sgp-cronograma/projeto/{projetoId} */
export interface SgpCronogramaByProjetoResponse {
  success: boolean;
  data: SgpCronogramaItem[];
  pagination: SgpCronogramaPagination;
}

/** Corpo POST/PUT /sgp-cronograma (PascalCase — API externa). */
export interface CreateSgpCronogramaRequest {
  Registro: number;
  Dias: number;
  Id_Tipo: number;
  Observacao?: string | null;
  Horas: number;
  Concluido: boolean;
  ObjetivoQuem: string;
  HoraPrevista: string;
  DataInicio: string;
  DataTermino: string;
  HoraRealizada?: string | null;
  Id_Papel: number;
  NaoGerarOcorrencia: number;
}

export type UpdateSgpCronogramaRequest = CreateSgpCronogramaRequest;

/** Resposta POST /sgp-cronograma */
export interface CreateSgpCronogramaApiResponse {
  success: boolean;
  message: string;
  data: SgpCronogramaItem;
}

export type UpdateSgpCronogramaApiResponse = CreateSgpCronogramaApiResponse;

/** Resposta DELETE /sgp-cronograma/{sequencia} */
export interface DeleteSgpCronogramaApiResponse {
  success: boolean;
  message: string;
}
