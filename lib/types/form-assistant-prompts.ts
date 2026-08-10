export type PromptType = "FORM_ASSISTANT" | "RELEASE_NOTES";

export const PROMPT_TYPES = ["FORM_ASSISTANT", "RELEASE_NOTES"] as const;

export function isPromptType(value: string | null | undefined): value is PromptType {
  return value === "FORM_ASSISTANT" || value === "RELEASE_NOTES";
}

export function parsePromptType(
  value: string | null | undefined,
  fallback: PromptType = "FORM_ASSISTANT",
): PromptType {
  return isPromptType(value) ? value : fallback;
}

export interface FormAssistantPrompt {
  id: string;
  squadSetor: string | null;
  tipo: PromptType;
  name: string;
  isActive: boolean;
  template: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResolvedFormAssistantPrompt extends FormAssistantPrompt {
  isDefault?: boolean;
}

export interface ToggleFormAssistantPromptData {
  id: string;
  isActive: boolean;
}

export interface CreateFormAssistantPromptRequest {
  tipo: PromptType;
  /** Obrigatório para FORM_ASSISTANT; opcional para RELEASE_NOTES (omitir = global). */
  squadSetor?: string;
  name: string;
  template: string;
}

export interface UpdateFormAssistantPromptRequest {
  name?: string;
  template?: string;
}

export interface AssistantApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DeleteFormAssistantPromptResponse {
  success: boolean;
  message?: string;
  error?: string;
}
