import { api } from "@/lib/axios";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ registro: string }> }
) {
  try {
    const { registro } = await params;

    if (!registro) {
      return Response.json(
        { error: "Parâmetro registro é obrigatório" },
        { status: 400 }
      );
    }

    const authorization = request.headers.get("authorization") ?? undefined;

    const response = await api.post(
      `/projeto-casos-producao/iniciar/${encodeURIComponent(registro)}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          ...(authorization ? { Authorization: authorization } : {}),
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
        data?: { message?: string; error?: string; caso_aberto?: number | null };
      };
      message?: string;
    };

    console.error("Erro na API Route ao iniciar produção:", error);

    const status = err?.response?.status ?? 500;
    const data = err?.response?.data;

    if (status === 400 || status === 422) {
      return Response.json(
        {
          success: false,
          message:
            data?.message ?? "Erro ao iniciar produção",
          caso_aberto: data?.caso_aberto ?? null,
        },
        { status }
      );
    }

    const errorMessage =
      data?.message ?? data?.error ?? err?.message ?? "Erro ao iniciar produção";
    return Response.json({ error: errorMessage }, { status });
  }
}
