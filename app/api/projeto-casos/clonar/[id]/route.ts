import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { scheduleDiscordCasoNotify } from "@/lib/discord/schedule-notify";
import {
  buildNotifyInputFromClone,
  type ClonarCasoApiData,
} from "@/lib/discord/parse-create-payload";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }
    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: "ID do caso é obrigatório" },
        { status: 400 }
      );
    }

    const response = await api.post(`/projeto-casos/clonar/${id}`, {}, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
    });

    const clonePayload = response.data as {
      data?: ClonarCasoApiData;
    };
    const notifyInput = buildNotifyInputFromClone(
      clonePayload?.data ?? (response.data as ClonarCasoApiData),
    );
    if (notifyInput && authHeaders.Authorization) {
      scheduleDiscordCasoNotify(
        { Authorization: authHeaders.Authorization },
        notifyInput,
      );
    }

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    const err = error as {
      response?: { status?: number; data?: { message?: string; error?: string } };
      message?: string;
    };
    console.error("Erro na API Route ao clonar caso:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Erro ao clonar caso";
    return Response.json({ error: errorMessage }, { status });
  }
}
