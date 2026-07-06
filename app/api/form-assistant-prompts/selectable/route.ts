import { apiAssistant } from "@/lib/axios";
import { assistantProxyErrorResponse } from "@/lib/api-assistant/proxy-error";
import { withPermission } from "@/lib/api-db/with-permission";
import type { FormAssistantPrompt } from "@/lib/types/form-assistant-prompts";

/** Prompts ativos para seleção no assistente (abertura de caso/report). */
export async function GET() {
  return withPermission(["create-case", "create-report"], async () => {
    try {
      const response = await apiAssistant.get("/api/form-assistant-prompts");
      const payload = response.data as {
        success?: boolean;
        data?: FormAssistantPrompt[];
      };

      if (payload.success && Array.isArray(payload.data)) {
        return Response.json(
          {
            ...payload,
            data: payload.data.filter((prompt) => prompt.isActive),
          },
          { status: response.status },
        );
      }

      return Response.json(response.data, { status: response.status });
    } catch (error) {
      return assistantProxyErrorResponse(
        error,
        "Erro ao listar prompts selecionáveis do assistente",
      );
    }
  });
}
