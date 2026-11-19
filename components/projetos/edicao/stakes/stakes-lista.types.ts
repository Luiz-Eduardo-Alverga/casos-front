/** Uma linha editável da lista de stakeholders (valores como aparecem nos campos). */
export interface StakeLinha {
  /** Id estável da linha na tela (React key / useFieldArray). */
  key: string;
  /** `sequencia` do stake gravado; `null` = linha nova. */
  sequencia: number | null;
  /** `id_tipo` (função) como string; "" = não escolhida. */
  idTipo: string;
  /** `suporte_id` como string; "" = não escolhido. */
  colaboradorId: string;
  /** Nome exibido (e enviado em `Nomes`). */
  colaboradorLabel: string;
  /** Horas planejadas por dia, `HH:MM`. */
  planejada: string;
  /** Horas não planejadas por dia, `HH:MM`. */
  naoPlanejada: string;
  /** Dias, como digitado (só dígitos). */
  dias: string;
  observacao: string;
  /** Problema trazido do Importar/Colar (ex.: colaborador não encontrado); some ao editar. */
  problemaImportacao: string | null;
}

export type StakeLinhaStatus = "nova" | "alterada" | "salva";

export type StakeLinhaCampo =
  | "idTipo"
  | "colaboradorId"
  | "planejada"
  | "naoPlanejada"
  | "dias";

export interface StakeLinhaErros {
  /** Campos com borda de erro. */
  campos: Partial<Record<StakeLinhaCampo, true>>;
  /** Mensagens mostradas embaixo da linha ("Linha N: …" é montado na tela). */
  mensagens: string[];
}

/** Catálogos usados para validar e para ler texto colado. */
export interface StakesCatalogos {
  /** Tipos STAKEHOLDERS: `id` → nome. */
  tipos: Map<number, string>;
  /** Colaboradores: `id` → nome. */
  colaboradores: Map<number, string>;
}

export interface StakesTotais {
  pessoas: number;
  planejadasMin: number;
  naoPlanejadasMin: number;
  totalMin: number;
}

/** Linha lida de texto colado ou de outro projeto, antes de entrar na lista. */
export interface StakeLinhaImportada {
  /** Número da linha no texto colado (1 = primeira de dados) ou posição na origem. */
  numero: number;
  linha: StakeLinha;
  /** Problema de leitura que não impede importar (a linha entra com o erro marcado). */
  problema: string | null;
  /** Motivo do bloqueio (sem checkbox ativo), decisão #20. */
  bloqueio: "Já está no projeto" | "Repetido nesta lista" | null;
}
