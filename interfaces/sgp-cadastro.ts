/** Subestruturas de qualidade (retorno GET /sgp-cadastros/{id}) */
export interface SgpCadastroUsabilidade {
  item1: boolean;
  item2: boolean;
  item3: boolean;
  item4: boolean;
}

export interface SgpCadastroConfiabilidade {
  item1: boolean;
  item2: boolean;
}

export interface SgpCadastroFuncionalidade {
  item1: boolean;
  item2: boolean;
  item3: boolean;
}

/** Nome do campo conforme retorno da API (typo preservado) */
export interface SgpCadastroManutenbilidade {
  item1: boolean;
  item2: boolean;
  item3: boolean;
  item4: boolean;
}

export interface SgpCadastroEficiencia {
  item1: boolean;
  item2: boolean;
}

export interface SgpCadastroViabilidadeDetalhe {
  custo: boolean;
  prazo: boolean;
  operacional: boolean;
  tecnica: boolean;
  custo_obs: string | null;
  prazo_obs: string | null;
  operacional_obs: string | null;
  tecnica_obs: string | null;
}

/** Registro de cadastro SGP (retorno da API sgp-cadastros por id) */
export interface SgpCadastroData {
  registro: number;
  cliente: number;
  data_inicio: string;
  data_fim: string;
  datas: string;
  nome_projeto: string;
  necessidades: string | null;
  expectativas: string | null;
  usuario: number;
  encerramento: string | null;
  tipo: string;
  data_desativado: string;
  marketing: unknown | null;
  comentario_amostra: string | null;
  qualidade: unknown | null;
  status: string;
  objetivo: string;
  classe_projeto: string | null;
  pdv: string;
  setor: string;
  caminho_baseline: string;
  objetivo_id: number;
  estacionamento_ideias: boolean;
  usabilidade: SgpCadastroUsabilidade;
  confiabilidade: SgpCadastroConfiabilidade;
  funcionalidade: SgpCadastroFuncionalidade;
  manutenbilidade: SgpCadastroManutenbilidade;
  eficiencia: SgpCadastroEficiencia;
  viabilidade: SgpCadastroViabilidadeDetalhe;
}

/** Resposta da API ao buscar um cadastro SGP por ID */
export interface SgpCadastroResponse {
  success: boolean;
  data: SgpCadastroData;
}
