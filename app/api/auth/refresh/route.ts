import { api } from "@/lib/axios";

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization") ?? undefined;

    if (!authorization) {
      return Response.json(
        { error: "Header Authorization é obrigatório" },
        { status: 400 }
      );
    }

    const response = await api.post(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: authorization,
        },
      }
    );

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Erro na API Route de refresh token:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao renovar token";
    return Response.json({ error: errorMessage }, { status });
  }
}
