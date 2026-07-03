import { apiAssistant } from "@/lib/axios";
import { requireSessionAuth } from "@/lib/auth-server";
import { assistantProxyErrorResponse } from "@/lib/api-assistant/proxy-error";

function parseSquadSetor(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") return value;
  return null;
}

export async function POST(request: Request) {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const incoming = await request.formData();
      const formData = new FormData();
      const squadSetor = parseSquadSetor(incoming.get("squadSetor"));

      for (const [key, value] of incoming.entries()) {
        if (key === "squadSetor") continue;
        formData.append(key, value);
      }

      if (squadSetor) {
        formData.set("squadSetor", squadSetor);
      }

      const response = await apiAssistant.post("/api/assistant", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return Response.json(response.data, { status: response.status });
    }

    const body = await request.json().catch(() => ({}));
    const description =
      typeof body?.description === "string" ? body.description : "";
    const squadSetor = parseSquadSetor(body?.squadSetor);

    const payload: { description: string; squadSetor?: string } = {
      description,
    };
    if (squadSetor) {
      payload.squadSetor = squadSetor;
    }

    const response = await apiAssistant.post("/api/assistant", payload);

    return Response.json(response.data, { status: response.status });
  } catch (error) {
    return assistantProxyErrorResponse(
      error,
      "Erro ao processar assistente de abertura de caso",
    );
  }
}
