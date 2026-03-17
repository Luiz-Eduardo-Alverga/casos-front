import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ registro: string }> }
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }
    const { registro } = await params;

    if (!registro) {
      return Response.json(
        { error: "Parâmetro registro é obrigatório" },
        { status: 400 }
      );
    }

    const response = await api.post(
      `/projeto-casos-producao/parar/${encodeURIComponent(registro)}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      }
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

    console.error("Erro na API Route ao parar produção:", error);

    const status = err?.response?.status ?? 500;
    const data = err?.response?.data;
    const errorMessage =
      data?.message ?? data?.error ?? err?.message ?? "Erro ao parar produção";

    return Response.json({ error: errorMessage }, { status });
  }
}
