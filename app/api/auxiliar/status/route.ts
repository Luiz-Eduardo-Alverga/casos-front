import { api } from "@/lib/axios";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization") ?? undefined;

    const response = await api.get("/auxiliar/status", {
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
    console.error("Erro na API Route de status:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao buscar status";
    return Response.json({ error: errorMessage }, { status });
  }
}
