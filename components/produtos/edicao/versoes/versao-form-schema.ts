import { z } from "zod";
import { todayIsoDate } from "@/components/produtos/edicao/versoes/utils";

import { PRODUTO_LABELS } from "@/components/produtos/constants";

const versaoNumericaRegex = /^\d+(\.\d+)*$/;

/**
 * Versões que não são número: agrupam casos fora de uma release.
 * Gravadas em maiúsculas, como já existem no legado (MELHORIA, BUG, BACKLOG).
 */
export const VERSOES_ESPECIAIS = ["MELHORIA", "BUG", "BACKLOG"] as const;

/** Versão especial (qualquer caixa) vira maiúscula; número fica como está. */
export function normalizeVersaoInput(value: string): string {
  const trimmed = value.trim();
  const upper = trimmed.toUpperCase();
  return (VERSOES_ESPECIAIS as readonly string[]).includes(upper)
    ? upper
    : trimmed;
}

export function isVersaoValida(value: string): boolean {
  const normalized = normalizeVersaoInput(value);
  return (
    versaoNumericaRegex.test(normalized) ||
    (VERSOES_ESPECIAIS as readonly string[]).includes(normalized)
  );
}

export const versaoFormSchema = z
  .object({
    versao: z
      .string()
      .trim()
      .min(1, "Informe a versão")
      .refine(isVersaoValida, PRODUTO_LABELS.versaoFormato),
    status: z.enum(["ABERTO", "FECHADO"]),
    abertura: z.string().trim().min(1, "Informe a data de abertura"),
    fechamento: z.string().optional(),
    testadorId: z.string().optional(),
    notas: z.string().optional(),
    helptools: z.boolean(),
    estacionamentoIdeias: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const fechamento = data.fechamento?.trim();
    if (fechamento && data.abertura && fechamento < data.abertura) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fechamento"],
        message: "Não pode ser anterior à data de abertura",
      });
    }
  });

export type VersaoFormData = z.infer<typeof versaoFormSchema>;

export function getVersaoFormDefaultValues(): VersaoFormData {
  return {
    versao: "",
    status: "ABERTO",
    abertura: todayIsoDate(),
    fechamento: "",
    testadorId: "",
    notas: "",
    helptools: false,
    estacionamentoIdeias: false,
  };
}
