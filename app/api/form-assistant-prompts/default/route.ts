import { apiAssistant } from "@/lib/axios";
import { requireSessionAuth } from "@/lib/auth-server";
import { assistantProxyErrorResponse } from "@/lib/api-assistant/proxy-error";

export async function GET() {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const response = await apiAssistant.get("/api/form-assistant-prompts/default");
    return Response.json(response.data, { status: response.status });
  } catch (error) {
    return assistantProxyErrorResponse(
      error,
      "Erro ao buscar prompt DEFAULT do assistente",
    );
  }
}
