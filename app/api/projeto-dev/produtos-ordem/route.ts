import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }
    const url = new URL(request.url);
    const id_colaborador = url.searchParams.get("id_colaborador");
    const page = url.searchParams.get("page");

    if (!id_colaborador) {
      return Response.json(
        { error: "Parametro id_colaborador é obrigatório" },
        { status: 400 },
      );
    }

    const response = await api.get("/projeto-dev-produtos-ordem", {
      params: {
        id_colaborador,
        ...(page ? { page } : {}),
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
    console.error("Erro na API Route de produtos ordem:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao buscar produtos ordem";
    return Response.json({ error: errorMessage }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const id_colaborador = body?.id_colaborador;
    const id_produto = body?.id_produto;
    const versao = body?.versao;
    const ordem = body?.ordem;

    if (
      id_colaborador === undefined ||
      id_produto === undefined ||
      versao === undefined ||
      ordem === undefined
    ) {
      return Response.json(
        {
          error:
            "Campos obrigatórios: id_colaborador, id_produto, versao, ordem",
        },
        { status: 400 },
      );
    }

    const response = await api.post(
      "/projeto-dev-produtos-ordem",
      { id_colaborador, id_produto, versao, ordem },
      { headers: authHeaders },
    );

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Erro na API Route de criação de ordem:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message || error?.message || "Erro ao criar ordem";
    return Response.json({ error: errorMessage }, { status });
  }
}
