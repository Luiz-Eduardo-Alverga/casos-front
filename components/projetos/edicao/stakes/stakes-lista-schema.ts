import { z } from "zod";

/** `HH:MM` com minutos abaixo de 60 (horas por dia). */
const horasSchema = (rotulo: string) =>
  z
    .string()
    .trim()
    .min(1, `Informe ${rotulo}`)
    .regex(/^\d{1,2}:[0-5]\d$/, `${capitalizar(rotulo)}: use HH:MM com minutos abaixo de 60`);

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Formato de uma linha (o que não depende de catálogo nem das outras linhas). */
export const stakeLinhaSchema = z.object({
  key: z.string(),
  sequencia: z.number().nullable(),
  idTipo: z.string().min(1, "Escolha a função"),
  colaboradorId: z.string().min(1, "Escolha um colaborador da lista"),
  colaboradorLabel: z.string(),
  planejada: horasSchema("as horas planejadas"),
  naoPlanejada: horasSchema("as horas não planejadas"),
  dias: z
    .string()
    .trim()
    .regex(/^\d+$/, "Dias: informe um número inteiro")
    .refine((v) => Number(v) >= 1, "Dias: informe pelo menos 1"),
  observacao: z.string(),
  problemaImportacao: z.string().nullable(),
});

export const stakesListaSchema = z.object({
  linhas: z.array(stakeLinhaSchema),
});

export type StakesListaFormValues = z.infer<typeof stakesListaSchema>;
