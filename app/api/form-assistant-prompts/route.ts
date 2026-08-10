import { apiAssistant } from "@/lib/axios";
import { assistantProxyErrorResponse } from "@/lib/api-assistant/proxy-error";
import { withPermission } from "@/lib/api-db/with-permission";
import { isPromptType } from "@/lib/types/form-assistant-prompts";

export async function GET(request: Request) {
  return withPermission("list-prompts", async () => {
    try {
      const { searchParams } = new URL(request.url);
      const tipoParam = searchParams.get("tipo");
      const params: Record<string, string> = {};

      if (isPromptType(tipoParam)) {
        params.tipo = tipoParam;
      }

      const squadSetor = searchParams.get("squadSetor");
      if (squadSetor) {
        params.squadSetor = squadSetor;
      }

      const response = await apiAssistant.get("/api/form-assistant-prompts", {
        params,
      });
      return Response.json(response.data, { status: response.status });
    } catch (error) {
      return assistantProxyErrorResponse(
        error,
        "Erro ao listar prompts do assistente",
      );
    }
  });
}

export async function POST(request: Request) {
  return withPermission("create-prompts", async () => {
    try {
      const body = await request.json();
      const response = await apiAssistant.post(
        "/api/form-assistant-prompts",
        body,
      );
      return Response.json(response.data, { status: response.status });
    } catch (error) {
      return assistantProxyErrorResponse(
        error,
        "Erro ao criar prompt do assistente",
      );
    }
  });
}
