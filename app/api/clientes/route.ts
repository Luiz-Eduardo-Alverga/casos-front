import { requireSessionAuth } from "@/lib/auth-server";
import { getSoftcomCloudApi } from "@/lib/softcom-cloud/client";
import { softcomCloudProxyErrorResponse } from "@/lib/softcom-cloud/proxy-error";

export async function GET(request: Request) {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const url = new URL(request.url);
    const nome = url.searchParams.get("nome") ?? undefined;
    const page = url.searchParams.get("page") ?? undefined;
    const pageSize = url.searchParams.get("pageSize") ?? undefined;

    const response = await getSoftcomCloudApi().get("/clientes", {
      params: {
        ...(nome ? { nome } : {}),
        ...(page ? { page } : {}),
        ...(pageSize ? { pageSize } : {}),
      },
    });

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Configuração ausente")
    ) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return softcomCloudProxyErrorResponse(error, "Erro ao buscar clientes");
  }
}
