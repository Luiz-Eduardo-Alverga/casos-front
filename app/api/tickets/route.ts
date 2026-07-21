import { requireSessionAuth } from "@/lib/auth-server";
import { getSoftcomCloudApi } from "@/lib/softcom-cloud/client";
import { softcomCloudProxyErrorResponse } from "@/lib/softcom-cloud/proxy-error";
import type { CreateTicketRequest } from "@/interfaces/cliente-ticket";

export async function POST(request: Request) {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const body = (await request.json()) as CreateTicketRequest;

    if (body.clienteId == null) {
      return Response.json(
        { error: "clienteId é obrigatório" },
        { status: 400 },
      );
    }

    if (!body.motivo?.trim()) {
      return Response.json(
        { error: "motivo é obrigatório" },
        { status: 400 },
      );
    }

    const response = await getSoftcomCloudApi().post("/tickets", body);

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
    return softcomCloudProxyErrorResponse(error, "Erro ao criar ocorrência");
  }
}
