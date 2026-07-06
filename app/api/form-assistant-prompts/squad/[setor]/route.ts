import { apiAssistant } from "@/lib/axios";
import { assistantProxyErrorResponse } from "@/lib/api-assistant/proxy-error";
import { withPermission } from "@/lib/api-db/with-permission";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ setor: string }> },
) {
  return withPermission(["create-case", "create-report", "list-prompts"], async () => {
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
  });
}
