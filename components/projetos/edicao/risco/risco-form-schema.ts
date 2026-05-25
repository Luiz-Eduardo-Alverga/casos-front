import { z } from "zod";

export const RISCO_NIVEL_VALUES = ["ALTO", "MEDIO", "BAIXO"] as const;

export type RiscoNivelValue = (typeof RISCO_NIVEL_VALUES)[number];

const nivelSchema = z.enum(RISCO_NIVEL_VALUES, {
  errorMap: () => ({ message: "Selecione uma opção válida" }),
});

export const riscoFormSchema = z.object({
  idRisco: z.string().min(1, "Selecione o risco"),
  idRiscoLabel: z.string().optional(),
  probalidade: nivelSchema,
  impacto: nivelSchema,
  mitigacao: z.string().optional(),
  contingencia: z.string().optional(),
});

export type RiscoFormValues = z.infer<typeof riscoFormSchema>;

export const riscoFormDefaultValues: RiscoFormValues = {
  idRisco: "",
  idRiscoLabel: "",
  probalidade: "BAIXO",
  impacto: "BAIXO",
  mitigacao: "",
  contingencia: "",
};
