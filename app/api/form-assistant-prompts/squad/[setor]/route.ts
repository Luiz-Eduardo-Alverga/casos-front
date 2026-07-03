import { apiAssistant } from "@/lib/axios";
import { requireSessionAuth } from "@/lib/auth-server";
import { assistantProxyErrorResponse } from "@/lib/api-assistant/proxy-error";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ setor: string }> },
) {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;

  const { setor } = await params;
  if (!setor) {
    return Response.json(
      { success: false, error: "Parâmetro setor é obrigatório." },
      { status: 400 },
    );
  }

  try {
    const response = await apiAssistant.get(
      `/api/form-assistant-prompts/squad/${encodeURIComponent(setor)}`,
    );
    return Response.json(response.data, { status: response.status });
  } catch (error) {
    return assistantProxyErrorResponse(
      error,
      "Erro ao buscar prompt do squad",
    );
  }
}
