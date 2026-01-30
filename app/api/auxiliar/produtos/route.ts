import { api } from "@/lib/axios";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") ?? undefined;

    const authorization = request.headers.get("authorization") ?? undefined;

    const response = await api.get("/auxiliar/produtos", {
      params: {
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
    console.error("Erro na API Route de produtos:", error);
    return Response.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

