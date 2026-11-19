import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";
import { criarCaso } from "@/lib/casos/criar-caso";
import type { ProjetoCasoCreateBody } from "@/lib/discord/parse-create-payload";

export async function POST(request: Request) {
  return withPermission(["create-report", "create-case"], async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }
      const body = (await request.json()) as ProjetoCasoCreateBody;

      const result = await criarCaso(
        { Authorization: authHeaders.Authorization },
        body,
      );

      return Response.json(result.data, {
        status: result.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error: any) {
      console.error("Erro na API Route de criação de caso:", error);
      const status = error?.response?.status || 500;
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao criar caso";
      return Response.json({ error: errorMessage }, { status });
    }
  });
}
