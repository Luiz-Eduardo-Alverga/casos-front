import { api } from "@/lib/axios";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization") ?? undefined;

    const response = await api.get("/auxiliar/tamanhos", {
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
  } catch (error: unknown) {
    const err = error as {
      message: string | undefined;
      response?: {
        status?: number;
        data?: { message?: string };
        message?: string;
      };
    };
    console.error("Erro na API Route de tamanhos:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.message ??
      err?.message ??
      "Erro ao buscar tamanhos";
    return Response.json(
      { error: errorMessage ?? "Erro ao buscar tamanhos" },
      { status },
    );
  }
}
