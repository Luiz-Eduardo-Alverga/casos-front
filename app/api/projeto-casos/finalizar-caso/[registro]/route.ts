import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ registro: string }> },
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { registro } = await params;

    if (!registro) {
      return Response.json(
        { error: "Registro do caso é obrigatório" },
        { status: 400 },
      );
    }

    const response = await api.post(
      `/projeto-casos/finalizar-caso/${encodeURIComponent(registro)}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      },
    );

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const err = error as {
      response?: { status?: number; data?: { message?: string; error?: string } };
      message?: string;
    };
    console.error("Erro na API Route ao finalizar caso:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Erro ao finalizar caso";
    return Response.json({ error: errorMessage }, { status });
  }
}
