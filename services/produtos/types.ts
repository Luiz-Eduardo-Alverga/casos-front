export interface ProdutoData {
  Registro: number;
  DataProjeto: string;
  NomeProjeto: string;
  PO: string;
  ScrumMaster: string;
  Setor: string;
  Comercial_Necessidades_ID: number | null;
  Responsavel_Suporte: string;
  Responsavel_Parametrizacao: string;
  Desativado: boolean;
  MostrarConsulta: boolean;
  MostrarTeste: boolean;
  VinculadoA: number;
  FAQExibir: boolean;
  InformacoesTecnicas: string | null;
  CalcularBurnDown: boolean;
  responsavel_bugs_suporte_id: number | null;
  responsavel_melhorias_suporte_id: number | null;
  vacaLeiteira: number;
}

export interface ProdutoVersaoData {
  Sequencia: number;
  Registro: number;
  DataVersao: string;
  Versao: string;
  DataAberturaProjeto: string;
  DataFechamentoProjeto: string | null;
  MostrarPlanejamento: boolean;
  Status: string;
  Release: number;
  HomemDiaHora: number | null;
  NotasdaVersao: string | null;
  VersaoBanco: string | null;
  Helptools: boolean;
  VersaoBancoMesas: string | null;
  testador_id: number | null;
  estacionamento_ideias: boolean;
}

export interface ProdutoModuloData {
  Sequencia: number;
  Registro: number;
  NomeModulo: string;
  OrdemImpressao: number | null;
  Nivel: number;
  Parent_ID: number | null;
  Descricao: string | null;
  LocalArquivo: string | null;
  Versionado: boolean;
  Atualizador: boolean;
}

export interface ProdutoChecklistData {
  ID: number;
  Projeto_Versoes_ID: number;
  DescricaoItem: string;
  Ordenacao: number;
  id_responsavel: number | null;
}

export interface ProdutoScriptData {
  id: number;
  projetoVersoes_id: number;
  descricao: string;
  procedimento: string;
  ordenador: number | null;
}

export interface CursorPagination {
  per_page: number;
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
}

export type ProdutoPagination = CursorPagination;

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: CursorPagination;
}

export interface DetailResponse<T> {
  success: boolean;
  data: T;
}

export interface WriteResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export type ProdutosListResponse = PaginatedResponse<ProdutoData>;
export type ProdutoResponse = DetailResponse<ProdutoData>;
export type ProdutoVersoesListResponse = PaginatedResponse<ProdutoVersaoData>;
export type ProdutoModulosListResponse = PaginatedResponse<ProdutoModuloData>;
export type ProdutoChecklistListResponse = PaginatedResponse<ProdutoChecklistData>;
export type ProdutoScriptsListResponse = PaginatedResponse<ProdutoScriptData>;

/** Escrita de produto (sem Registro; DataProjeto opcional — a rota injeta se faltar). */
export type ProdutoPayload = Omit<ProdutoData, "Registro" | "DataProjeto"> & {
  DataProjeto?: string;
};

/** Escrita de versão (Registro/DataVersao/Release/MostrarPlanejamento podem ser injetados). */
export type ProdutoVersaoPayload = Omit<
  ProdutoVersaoData,
  | "Sequencia"
  | "DataVersao"
  | "Registro"
  | "Release"
  | "MostrarPlanejamento"
> & {
  Registro?: number;
  DataVersao?: string;
  Release?: number;
  MostrarPlanejamento?: boolean;
};

/** Escrita de módulo (Registro/Versionado/Atualizador podem ser injetados). */
export type ProdutoModuloPayload = Omit<
  ProdutoModuloData,
  "Sequencia" | "Registro" | "Versionado" | "Atualizador"
> & {
  Registro?: number;
  Versionado?: boolean;
  Atualizador?: boolean;
};

/** Escrita de checklist (sem ID; Projeto_Versoes_ID pode ser injetado). */
export type ProdutoChecklistPayload = Omit<
  ProdutoChecklistData,
  "ID" | "Projeto_Versoes_ID"
> & {
  Projeto_Versoes_ID?: number;
};

/** Escrita de script (sem id; projetoVersoes_id pode ser injetado). */
export type ProdutoScriptPayload = Omit<
  ProdutoScriptData,
  "id" | "projetoVersoes_id"
> & {
  projetoVersoes_id?: number;
};

export type CreateProdutoRequest = ProdutoPayload & { DataProjeto: string };
export type UpdateProdutoRequest = CreateProdutoRequest;
export type CreateProdutoResponse = WriteResponse<ProdutoData>;
export type UpdateProdutoResponse = WriteResponse<ProdutoData>;

export type CreateProdutoVersaoRequest = ProdutoVersaoPayload & {
  Registro: number;
  DataVersao: string;
};
export type UpdateProdutoVersaoRequest = CreateProdutoVersaoRequest;
export type CreateProdutoVersaoResponse = WriteResponse<ProdutoVersaoData>;
export type UpdateProdutoVersaoResponse = WriteResponse<ProdutoVersaoData>;
export type DeleteProdutoVersaoResponse = DeleteResponse;

export type CreateProdutoModuloRequest = ProdutoModuloPayload & {
  Registro: number;
};
export type UpdateProdutoModuloRequest = CreateProdutoModuloRequest;
export type CreateProdutoModuloResponse = WriteResponse<ProdutoModuloData>;
export type UpdateProdutoModuloResponse = WriteResponse<ProdutoModuloData>;
export type DeleteProdutoModuloResponse = DeleteResponse;

export type CreateProdutoChecklistRequest = ProdutoChecklistPayload & {
  Projeto_Versoes_ID: number;
};
export type UpdateProdutoChecklistRequest = CreateProdutoChecklistRequest;
export type CreateProdutoChecklistResponse = WriteResponse<ProdutoChecklistData>;
export type UpdateProdutoChecklistResponse = WriteResponse<ProdutoChecklistData>;
export type DeleteProdutoChecklistResponse = DeleteResponse;

export type CreateProdutoScriptRequest = ProdutoScriptPayload & {
  projetoVersoes_id: number;
};
export type UpdateProdutoScriptRequest = CreateProdutoScriptRequest;
export type CreateProdutoScriptResponse = WriteResponse<ProdutoScriptData>;
export type UpdateProdutoScriptResponse = WriteResponse<ProdutoScriptData>;
export type DeleteProdutoScriptResponse = DeleteResponse;

export interface GetProdutosParams {
  NomeProjeto?: string;
  nomeProjeto?: string;
  Setor?: string;
  setor?: string;
  per_page?: number;
  cursor?: string | null;
}

export interface GetProdutoNestedParams {
  produtoId?: number | string;
  per_page?: number;
  cursor?: string | null;
}

export type GetProdutoVersoesParams = GetProdutoNestedParams & {
  registro?: number | string;
};

export type GetProdutoModulosParams = GetProdutoNestedParams & {
  registro?: number | string;
};

export type GetProdutoChecklistParams = GetProdutoNestedParams & {
  projetoVersoesId?: number | string;
};

export type GetProdutoScriptsParams = GetProdutoNestedParams & {
  projetoVersoesId?: number | string;
};
