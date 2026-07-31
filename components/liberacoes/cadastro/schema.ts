import { z } from "zod";
import { DEFAULT_TIPO_LIBERACAO } from "@/components/liberacoes/constants";

export const liberacaoCreateFormSchema = z.object({
  produtoId: z.string().min(1, "Produto é obrigatório"),
  /** Espelha produtoId para o CasoFormVersao (watch("produto")). */
  produto: z.string().optional(),
  tipoLiberacao: z.string().min(1, "Tipo de liberação é obrigatório"),
  versaoFinalDataPrevista: z.date().optional(),
  observacao: z.string().optional(),
  /** Sequencia selecionada no combobox (temporária, antes de adicionar aos chips). */
  versao: z.string().optional(),
  /** Versões já adicionadas (texto da API, ex.: "8.0.1.0"). */
  versoes: z.array(z.string()).min(1, "Informe ao menos uma versão"),
});

export type LiberacaoCreateFormData = z.infer<typeof liberacaoCreateFormSchema>;

export const LIBERACAO_CREATE_DEFAULT_VALUES: LiberacaoCreateFormData = {
  produtoId: "",
  produto: "",
  tipoLiberacao: DEFAULT_TIPO_LIBERACAO,
  versaoFinalDataPrevista: undefined,
  observacao: "",
  versao: "",
  versoes: [],
};
