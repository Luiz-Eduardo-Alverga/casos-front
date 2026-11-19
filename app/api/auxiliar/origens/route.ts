import { getOrigensCatalogo } from "@/lib/auxiliar/catalogos";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") ?? undefined;

    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const response = await getOrigensCatalogo(
      { Authorization: authHeaders.Authorization },
      { search },
    );

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Erro na API Route de origens:", error);
    const status = error?.response?.status || 500;
    const errorMessage = error?.response?.data?.message || error?.message || "Erro ao buscar origens";
    return Response.json({ error: errorMessage }, { status });
  }
}
