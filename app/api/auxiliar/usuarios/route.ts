import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") ?? undefined;
    const somenteProjetosRaw = url.searchParams.get("somente_projetos");
    // Converte para boolean para evitar tratar "false" (string) como truthy no backend.
    const somente_projetos =
      somenteProjetosRaw === null ? undefined : somenteProjetosRaw === "true";
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const response = await api.get("/auxiliar/usuarios", {
      params: {
        ...(search ? { search } : {}),
        ...(somente_projetos !== undefined ? { somente_projetos } : {}),
      },
      headers: authHeaders,
    });

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Erro na API Route de usuários:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao buscar usuários";
    return Response.json({ error: errorMessage }, { status });
  }
}
