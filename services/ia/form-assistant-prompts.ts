import { fetchWithAuth } from "@/lib/fetch";
import type {
  AssistantApiResponse,
  CreateFormAssistantPromptRequest,
  DeleteFormAssistantPromptResponse,
  FormAssistantPrompt,
  ResolvedFormAssistantPrompt,
  ToggleFormAssistantPromptData,
  UpdateFormAssistantPromptRequest,
} from "@/lib/types/form-assistant-prompts";

async function parseAssistantApiResponse<T>(
  response: Response,
  fallbackError: string,
): Promise<T> {
  const json = (await response.json().catch(() => ({}))) as AssistantApiResponse<T>;

  if (!response.ok) {
    throw new Error(json.error || json.message || fallbackError);
  }

  if (!json.success) {
    throw new Error(json.error || json.message || fallbackError);
  }

  if (json.data === undefined) {
    throw new Error(fallbackError);
  }

  return json.data;
}

async function parseAssistantApiMessageResponse(
  response: Response,
  fallbackError: string,
): Promise<DeleteFormAssistantPromptResponse> {
  const json = (await response.json().catch(
    () => ({}),
  )) as DeleteFormAssistantPromptResponse;

  if (!response.ok) {
    throw new Error(json.error || json.message || fallbackError);
  }

  if (!json.success) {
    throw new Error(json.error || json.message || fallbackError);
  }

  return json;
}

export async function getFormAssistantPrompts(): Promise<FormAssistantPrompt[]> {
  const response = await fetchWithAuth("/api/form-assistant-prompts", {
    method: "GET",
  });

  return parseAssistantApiResponse<FormAssistantPrompt[]>(
    response,
    "Erro ao listar prompts do assistente",
  );
}

export async function getSelectableFormAssistantPrompts(): Promise<
  FormAssistantPrompt[]
> {
  const response = await fetchWithAuth(
    "/api/form-assistant-prompts/selectable",
    { method: "GET" },
  );

  return parseAssistantApiResponse<FormAssistantPrompt[]>(
    response,
    "Erro ao listar prompts selecionáveis do assistente",
  );
}

export async function getFormAssistantPromptDefault(): Promise<FormAssistantPrompt> {
  const response = await fetchWithAuth("/api/form-assistant-prompts/default", {
    method: "GET",
  });

  return parseAssistantApiResponse<FormAssistantPrompt>(
    response,
    "Erro ao buscar prompt DEFAULT do assistente",
  );
}

export async function getFormAssistantPromptBySquad(
  setor: string,
): Promise<ResolvedFormAssistantPrompt> {
  const url = new URL(
    `/api/form-assistant-prompts/squad/${encodeURIComponent(setor)}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  return parseAssistantApiResponse<ResolvedFormAssistantPrompt>(
    response,
    "Erro ao buscar prompt do squad",
  );
}

export async function createFormAssistantPrompt(
  body: CreateFormAssistantPromptRequest,
): Promise<FormAssistantPrompt> {
  const response = await fetchWithAuth("/api/form-assistant-prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return parseAssistantApiResponse<FormAssistantPrompt>(
    response,
    "Erro ao criar prompt do assistente",
  );
}

export async function updateFormAssistantPrompt(
  id: string,
  body: UpdateFormAssistantPromptRequest,
): Promise<FormAssistantPrompt> {
  const url = new URL(
    `/api/form-assistant-prompts/${encodeURIComponent(id)}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return parseAssistantApiResponse<FormAssistantPrompt>(
    response,
    "Erro ao atualizar prompt do assistente",
  );
}

export async function toggleFormAssistantPrompt(
  id: string,
): Promise<ToggleFormAssistantPromptData> {
  const url = new URL(
    `/api/form-assistant-prompts/${encodeURIComponent(id)}/toggle`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "PATCH" });

  return parseAssistantApiResponse<ToggleFormAssistantPromptData>(
    response,
    "Erro ao alternar status do prompt",
  );
}

export async function deleteFormAssistantPrompt(
  id: string,
): Promise<DeleteFormAssistantPromptResponse> {
  const url = new URL(
    `/api/form-assistant-prompts/${encodeURIComponent(id)}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "DELETE" });

  return parseAssistantApiMessageResponse(
    response,
    "Erro ao excluir prompt do assistente",
  );
}
