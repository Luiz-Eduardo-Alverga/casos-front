import { parseAsStringLiteral } from "nuqs";
import {
  PROMPT_TYPES,
  type PromptType,
} from "@/lib/types/form-assistant-prompts";

export const promptsIaTipoParsers = {
  tipo: parseAsStringLiteral(PROMPT_TYPES).withDefault("FORM_ASSISTANT"),
};

export const PROMPT_TYPE_OPTIONS: { value: PromptType; label: string }[] = [
  { value: "FORM_ASSISTANT", label: "Assistente de casos" },
  { value: "RELEASE_NOTES", label: "Registro de liberação" },
];

export const PROMPT_TYPE_SUBTITLES: Record<PromptType, string> = {
  FORM_ASSISTANT: "Gerencie os prompts do assistente de abertura de caso",
  RELEASE_NOTES: "Gerencie os modelos de prompt do registro de liberação",
};
