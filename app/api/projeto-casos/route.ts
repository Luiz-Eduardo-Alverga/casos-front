import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";

export async function POST(request: Request) {
  return withPermission("create-case", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }
      const body = await request.json();

      const response = await api.post("/projeto-casos", body, {
        headers: authHeaders,
      });

      return Response.json(response.data, {
        status: response.status,
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
