import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ usuario: string }> },
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { usuario: usuarioParam } = await params;

    if (!usuarioParam) {
      return Response.json(
        { error: "Parâmetro usuario é obrigatório" },
        { status: 400 },
      );
    }

    const usuario = Number(usuarioParam);
    if (!Number.isFinite(usuario)) {
      return Response.json(
        { error: "Parâmetro usuario inválido" },
        { status: 400 },
      );
    }

    const response = await api.get(
      `/projeto-casos-producao/caso-aberto/${usuario}`,
      { headers: authHeaders },
    );

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    const err = error as {
      response?: {
        status?: number;
        data?: { message?: string; error?: string };
      };
      message?: string;
    };

    console.error("Erro na API Route ao buscar caso aberto:", error);

    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Erro ao buscar caso aberto";

    return Response.json({ error: errorMessage }, { status });
  }
}
