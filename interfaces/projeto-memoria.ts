/** Estruturas aninhadas do caso (projeto-memoria) */
export interface CasoDatas {
  abertura: string | null;
  conclusao_dev: string | null;
  conclusao_qa: string | null;
  prazo_conclusao: string | null;
}

export interface UsuarioRef {
  id: number | string;
  nome: string | null;
  setor_dev?: string;
}

export interface CasoUsuarios {
  abertura: UsuarioRef;
  relator: UsuarioRef;
  desenvolvimento: UsuarioRef;
  qa: UsuarioRef;
}

export interface CasoTempos {
  estimado_minutos: number;
  realizado_minutos: number;
  retorno_minutos: number;
  testando_minutos: number;
  desenvolvendo_minutos: number;
  nao_planejado_minutos: number;
  medio_faq_minutos: number | null;
  tempo_status: string;
  status_tempo: string;
}

export interface CasoQuantidadesApontadas {
  retorno: number;
  testando: number;
  desenvolvendo: number;
  producao: number;
}

export interface CasoStatus {
  id: string;
  codigo: string;
  descricao: string;
  estado: string;
  resolucao: string;
  tempo_status: string;
  status_tempo: string;
  status_id: string;
  status_tipo: string;
}

export interface CasoCaracteristicas {
  tamanho_pontos: number | null;
  prioridade: string;
  tipo_categoria: string;
  categoria: number;
  tipo_abertura: string;
  modulo: string | null;
  tipo_origem: string;
  id_origem: number;
}

export interface CasoFlags {
  bloqueado: boolean;
  entregue: boolean;
  nao_planejado: boolean;
  liberacao: boolean;
  sinc: boolean;
  mostrar_teste: boolean;
}

export interface CasoTextos {
  descricao_resumo: string | null;
  passos_para_reproduzir: string | null;
  descricao_commit: string | null;
  descricao_completa: string | null;
  informacoes_adicionais: string | null;
  anexo: string | null;
  historia: string | null;
}

export interface CasoRelacionamentos {
  dev_casos_id: number | null;
  faq_id: number | null;
  reuso_id: number | null;
  teste_faq_id: number | null;
  id_caso_pai: number | null;
  relator: number;
  valeu_caso: number;
  teste_valeu: number | null;
  id_origem: number;
  tipo_origem: string;
  id_melhorias: number | null;
  id_rfc: number | null;
  atualizador: number | null;
  atribuido_qa: number;
}

export interface CasoViabilidade {
  viabilidade: boolean;
  entendido: boolean;
  realizavel: boolean;
  completo: boolean;
}

export interface CasoFlagsAdicionais {
  lacrar: boolean;
  reducao_chamados: boolean;
  atualizacao_automatica: boolean;
}

/** Item de anotação do caso (retorno da API projeto-memoria por id) */
export interface AnotacaoCasoItem {
  sequencia: number;
  registro: number;
  data_anotacao: string;
  anotacoes: string;
  usuario: string;
}

/** Item de cliente vinculado ao caso (retorno da API projeto-memoria por id) */
export interface ClienteCasoItem {
  sequencia: number;
  registro: number;
  data_solicitacao: string;
  cliente: number;
  cliente_nome: string | null;
  incidente: number;
}

export interface CasoItem {
  id: number;
  datas: CasoDatas;
  usuarios: CasoUsuarios;
  tempos: CasoTempos;
  quantidades_apontadas: CasoQuantidadesApontadas;
  status: CasoStatus;
  caracteristicas: CasoCaracteristicas;
  flags: CasoFlags;
  textos: CasoTextos;
  relacionamentos: CasoRelacionamentos;
  viabilidade: CasoViabilidade;
  flags_adicionais: CasoFlagsAdicionais;
  producao: unknown;
  anotacoes?: AnotacaoCasoItem[];
  clientes?: ClienteCasoItem[];
}

export interface ProjetoMemoriaDatas {
  inicial: string | null;
  final: string | null;
}

export interface ProjetoMemoriaSetores {
  setor: string;
  setor_projeto: string;
}

export interface ProjetoMemoriaProjeto {
  id: number;
  descricao: string;
  datas: ProjetoMemoriaDatas;
  setores: ProjetoMemoriaSetores;
}

export interface ProjetoMemoriaProduto {
  id: number;
  nome: string;
  versao: string;
  burndown_exibir: boolean;
  versao_estacionamento_ideias: boolean;
  versao_status: string;
  versao_release: boolean;
  versao_data_liberacao: string | null;
}

export interface ProjetoMemoriaReport {
  data_hora_incidente: string | null;
  data_limite: string | null;
  prioridade: string | null;
  analise_concluida: boolean;
  analise_status: string;
  analise_data_conclusao: string | null;
  sla: string | null;
  tipo_abertura: string;
  responsavel_feedback_nome: string | null;
}

export interface ProjetoMemoriaItem {
  caso: CasoItem;
  projeto: ProjetoMemoriaProjeto;
  produto: ProjetoMemoriaProduto;
  report: ProjetoMemoriaReport;
}

/** Resposta da API ao buscar um único item de projeto-memória por ID */
export interface ProjetoMemoriaItemResponse {
  success: boolean;
  data: ProjetoMemoriaItem;
}

export interface ProjetoMemoriaPagination {
  per_page: number;
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
}

export interface ProjetoMemoriaTotalizadores {
  tempo_total_estimado_minutos: number;
  tempo_total_realizado_minutos: number;
  total_pontos: number;
  custo_estimado_ponto: number;
  custo_real_ponto: number;
}

export interface ProjetoMemoriaResponse {
  success: boolean;
  data: ProjetoMemoriaItem[];
  pagination: ProjetoMemoriaPagination;
  totalizadores: ProjetoMemoriaTotalizadores;
}

export interface ProjetoMemoriaParams {
  per_page?: number;
  page?: number;
  /** Cursor para paginação infinita (next_cursor retornado pela API) */
  cursor?: string | null;
  descricao_resumo?: string;
  usuario_abertura_id?: string;
  usuario_dev_id?: string;
  usuario_qa_id?: string;
  atribuido_qa?: string;
  prioridade?: string;
  projeto_id?: string;
  setor?: string;
  setor_dev?: string;
  setor_projeto?: string;
  produto_id?: string;
  produto_nome?: string;
  versao_produto?: string;
  /** Um ou mais IDs de status (ex.: "1", "2" para status 1 e 2) */
  status_id?: string | string[] | null;
}
