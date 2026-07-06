import { apiAssistant } from "@/lib/axios";
import { assistantProxyErrorResponse } from "@/lib/api-assistant/proxy-error";
import { withPermission } from "@/lib/api-db/with-permission";

export async function GET() {
  return withPermission(["create-case", "create-report", "list-prompts"], async () => {
    try {
      const response = await apiAssistant.get(
        "/api/form-assistant-prompts/default",
      );
      return Response.json(response.data, { status: response.status });
    } catch (error) {
      return assistantProxyErrorResponse(
        error,
        "Erro ao buscar prompt DEFAULT do assistente",
      );
    }
  });
}
