import { z } from "zod";

export const liberacaoEditFormSchema = z.object({
  produtoId: z.string().min(1, "Produto é obrigatório"),
  tipoLiberacao: z.string().min(1, "Tipo de liberação é obrigatório"),
  observacao: z.string().optional(),
  linkVideo: z.string().optional(),
  linkPdf: z.string().optional(),
  urlVersaoPiloto: z.string().optional(),
  previsaoLiberacao: z.date().optional(),
  previsaoPiloto: z.date().optional(),
  pilotoDataPrevista: z.date().optional(),
  pilotoDataLiberacao: z.date().optional(),
  versaoFinalDataPrevista: z.date().optional(),
  melhoriasDataInicial: z.date().optional(),
  melhoriasDataFinal: z.date().optional(),
  gerarOcorrenciasLiberacao: z.boolean(),
});

export type LiberacaoEditFormData = z.infer<typeof liberacaoEditFormSchema>;
