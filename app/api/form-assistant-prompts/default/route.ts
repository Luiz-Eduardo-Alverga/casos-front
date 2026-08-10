import { apiAssistant } from "@/lib/axios";
import { assistantProxyErrorResponse } from "@/lib/api-assistant/proxy-error";
import { withPermission } from "@/lib/api-db/with-permission";
import { isPromptType } from "@/lib/types/form-assistant-prompts";

export async function GET(request: Request) {
  return withPermission(
    ["create-case", "create-report", "list-prompts"],
    async () => {
      try {
        const { searchParams } = new URL(request.url);
        const tipoParam = searchParams.get("tipo");
        const params: Record<string, string> = {};

        if (isPromptType(tipoParam)) {
          params.tipo = tipoParam;
        }

        const response = await apiAssistant.get(
          "/api/form-assistant-prompts/default",
          { params },
        );
        return Response.json(response.data, { status: response.status });
      } catch (error) {
        return assistantProxyErrorResponse(
          error,
          "Erro ao buscar prompt DEFAULT do assistente",
        );
      }
    },
  );
}
