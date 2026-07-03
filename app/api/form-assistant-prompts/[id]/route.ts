import { apiAssistant } from "@/lib/axios";
import { requireSessionAuth } from "@/lib/auth-server";
import { assistantProxyErrorResponse } from "@/lib/api-assistant/proxy-error";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;

  const { id } = await params;
  if (!id) {
    return Response.json(
      { success: false, error: "ID do prompt é obrigatório." },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const response = await apiAssistant.put(
      `/api/form-assistant-prompts/${id}`,
      body,
    );
    return Response.json(response.data, { status: response.status });
  } catch (error) {
    return assistantProxyErrorResponse(
      error,
      "Erro ao atualizar prompt do assistente",
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;

  const { id } = await params;
  if (!id) {
    return Response.json(
      { success: false, error: "ID do prompt é obrigatório." },
      { status: 400 },
    );
  }

  try {
    const response = await apiAssistant.delete(
      `/api/form-assistant-prompts/${id}`,
    );
    return Response.json(response.data, { status: response.status });
  } catch (error) {
    return assistantProxyErrorResponse(
      error,
      "Erro ao excluir prompt do assistente",
    );
  }
}
