export interface FormAssistantPrompt {
  id: string;
  squadSetor: string | null;
  name: string;
  isActive: boolean;
  template: string;
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
  squadSetor: string;
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
