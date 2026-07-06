import { requireSessionAuth } from "@/lib/auth-server";
import { getSoftcomCloudApi } from "@/lib/softcom-cloud/client";
import { softcomCloudProxyErrorResponse } from "@/lib/softcom-cloud/proxy-error";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: "ID da ocorrência é obrigatório" },
        { status: 400 },
      );
    }

    const response = await getSoftcomCloudApi().get(`/tickets/${id}`);

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Configuração ausente")
    ) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return softcomCloudProxyErrorResponse(
      error,
      "Erro ao buscar detalhes da ocorrência",
    );
  }
}
