import { apiAssistant } from "@/lib/axios";
import { withPermission } from "@/lib/api-db/with-permission";
import { assistantProxyErrorResponse } from "@/lib/api-assistant/proxy-error";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ liberacaoId: string }> },
) {
  return withPermission("edit-release", async () => {
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
  });
}
