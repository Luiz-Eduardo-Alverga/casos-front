import { apiAssistant } from "@/lib/axios";
import { requireSessionAuth } from "@/lib/auth-server";
import { assistantProxyErrorResponse } from "@/lib/api-assistant/proxy-error";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ liberacaoId: string }> },
) {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { liberacaoId } = await params;

    if (!liberacaoId?.trim()) {
      return Response.json(
        { success: false, error: "Parâmetro liberacaoId é obrigatório" },
        { status: 400 },
      );
    }

    const response = await apiAssistant.get(
      `/api/release-notes/${encodeURIComponent(liberacaoId)}`,
    );

    return Response.json(response.data, { status: response.status });
  } catch (error) {
    return assistantProxyErrorResponse(
      error,
      "Erro ao gerar registro de liberação com IA",
    );
  }
}
