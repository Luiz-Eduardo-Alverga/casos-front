import { api } from "@/lib/axios";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const usuario_id = url.searchParams.get("usuario_id");
    const setor_projeto = url.searchParams.get("setor_projeto") ?? undefined;
    const numero_projeto = url.searchParams.get("numero_projeto") ?? undefined;
    const search = url.searchParams.get("search") ?? undefined;

    const authorization = request.headers.get("authorization") ?? undefined;

    if (!usuario_id) {
      return Response.json({ error: "usuario_id é obrigatório" }, { status: 400 });
    }

    const response = await api.get("/auxiliar/projetos", {
      params: {
        usuario_id,
        ...(setor_projeto ? { setor_projeto } : {}),
        ...(numero_projeto ? { numero_projeto } : {}),
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
    console.error("Erro na API Route de projetos:", error);
    return Response.json({ error: "Erro ao buscar projetos" }, { status: 500 });
  }
}
