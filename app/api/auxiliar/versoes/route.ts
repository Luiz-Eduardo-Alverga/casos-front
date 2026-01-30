import { api } from "@/lib/axios";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const produto_id = url.searchParams.get("produto_id");
    const search = url.searchParams.get("search") ?? undefined;

    if (!produto_id) {
      return Response.json(
        { error: "Parametro produto_id é obrigatório" },
        { status: 400 }
      );
    }

    const authorization = request.headers.get("authorization") ?? undefined;

    const response = await api.get("/auxiliar/versoes", {
      params: {
        produto_id,
        ...(search ? { search } : {}),
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
  } catch (error) {
    console.error("Erro na API Route de versões:", error);
    return Response.json({ error: "Erro ao buscar versões" }, { status: 500 });
  }
}

