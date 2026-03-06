import { api } from "@/lib/axios";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id_colaborador = url.searchParams.get("id_colaborador");

    if (!id_colaborador) {
      return Response.json(
        { error: "Parametro id_colaborador é obrigatório" },
        { status: 400 }
      );
    }

    const authorization = request.headers.get("authorization") ?? undefined;

    const response = await api.get("/projeto-dev-produtos-ordem", {
      params: {
        id_colaborador,
      },
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Erro na API Route de produtos ordem:", error);
    const status = error?.response?.status || 500;
    const errorMessage = error?.response?.data?.message || error?.message || "Erro ao buscar produtos ordem";
    return Response.json({ error: errorMessage }, { status });
  }
}
