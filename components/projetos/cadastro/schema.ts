import { z } from "zod";
import {
  DEFAULT_STATUS_PROJETO,
  DEFAULT_TIPO_PROJETO,
} from "@/components/projetos/cadastro/constants";

export const projetoFormSchema = z.object({
  nomeProjeto: z.string().min(1, "Nome do projeto é obrigatório"),
  dataInicio: z.date({ required_error: "Data de início é obrigatória" }),
  dataEncerramento: z.date().optional(),
  setor: z.string().optional(),
  tipo: z.string().min(1, "Tipo do projeto é obrigatório"),
  usuario: z.string().min(1, "Responsável é obrigatório"),
  status: z.string().min(1, "Status é obrigatório"),
  objetivo: z.string().optional(),
  necessidades: z.string().optional(),
  expectativas: z.string().optional(),
});

export type ProjetoFormData = z.infer<typeof projetoFormSchema>;

/** @deprecated Use ProjetoFormData */
export type ProjetoCreateFormData = ProjetoFormData;

/** @deprecated Use projetoFormSchema */
export const projetoCreateFormSchema = projetoFormSchema;

export function getProjetoCreateDefaultValues(usuarioId?: string) {
  return {
    nomeProjeto: "",
    setor: "",
    tipo: DEFAULT_TIPO_PROJETO,
    usuario: usuarioId ?? "",
    status: DEFAULT_STATUS_PROJETO,
    objetivo: "",
    necessidades: "",
    expectativas: "",
  };
}
