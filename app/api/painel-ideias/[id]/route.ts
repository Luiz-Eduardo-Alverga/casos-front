import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import type { UpdatePainelIdeiaRequest } from "@/services/painel-ideias/update-painel-ideia";

const STATUS_VALUES = new Set(["SIM", "NÃO"]);
const CONCLUIDO_VALUES = new Set(["Sim", "Não"]);

function validateBody(body: UpdatePainelIdeiaRequest): Response | null {
  if (!STATUS_VALUES.has(body?.status)) {
    return Response.json(
      { error: "status deve ser SIM ou NÃO" },
      { status: 400 },
    );
  }
  if (!CONCLUIDO_VALUES.has(body?.concluido)) {
    return Response.json(
      { error: "concluido deve ser Sim ou Não" },
      { status: 400 },
    );
  }
  if (typeof body?.justificativa !== "string") {
    return Response.json(
      { error: "justificativa é obrigatória" },
      { status: 400 },
    );
  }
  if (!body?.data_aprovado?.trim()) {
    return Response.json(
      { error: "data_aprovado é obrigatória" },
      { status: 400 },
    );
  }
  if (!body?.avaliado_por?.trim()) {
    return Response.json(
      { error: "avaliado_por é obrigatório" },
      { status: 400 },
    );
  }
  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: "Parametro id é obrigatório" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as UpdatePainelIdeiaRequest;
    const validationError = validateBody(body);
    if (validationError) return validationError;

    const response = await api.patch(`/painel-ideias/${id}`, body, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
    });

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const err = error as {
      response?: {
        status?: number;
        data?: { message?: string; error?: string };
      };
      message?: string;
    };
    console.error("Erro na API Route ao avaliar melhoria:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Erro ao avaliar melhoria";
    return Response.json({ error: errorMessage }, { status });
  }
}
