import { apiAssistant } from "@/lib/axios";
import { requireSessionAuth } from "@/lib/auth-server";
import { assistantProxyErrorResponse } from "@/lib/api-assistant/proxy-error";

export async function GET() {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const response = await apiAssistant.get("/api/form-assistant-prompts");
    return Response.json(response.data, { status: response.status });
  } catch (error) {
    return assistantProxyErrorResponse(
      error,
      "Erro ao listar prompts do assistente",
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    const response = await apiAssistant.post("/api/form-assistant-prompts", body);
    return Response.json(response.data, { status: response.status });
  } catch (error) {
    return assistantProxyErrorResponse(
      error,
      "Erro ao criar prompt do assistente",
    );
  }
}
