import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";
import { CASO_STATUS_CONCLUIDO_ID } from "@/components/casos/edicao/report-analise-modal/utils";
import { scheduleDiscordReportConcluidoNotify } from "@/lib/discord/schedule-notify";
import {
  buildReportConcluidoNotifyInput,
  shouldNotifyReportConcluido,
} from "@/lib/discord/notify-report-concluido";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";

function parseProjetoMemoriaItem(data: unknown): ProjetoMemoriaItem | null {
  if (!data || typeof data !== "object") return null;
  const root = data as { data?: unknown; caso?: unknown };
  const inner = root.data;
  if (inner && typeof inner === "object" && "caso" in inner) {
    return inner as ProjetoMemoriaItem;
  }
  if ("caso" in root) {
    return root as ProjetoMemoriaItem;
  }
  return null;
}

async function fetchCasoSnapshot(
  id: string,
  authHeaders: { Authorization: string },
): Promise<ProjetoMemoriaItem | null> {
  try {
    const response = await api.get(`/projeto-memoria/${id}`, {
      headers: authHeaders,
    });
    return parseProjetoMemoriaItem(response.data);
  } catch (error) {
    console.warn(
      `[discord] falha ao ler snapshot do caso ${id} para notificar conclusão:`,
      error,
    );
    return null;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission(["edit-case", "edit-report"], async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }
      const { id } = await params;

      if (!id) {
        return Response.json(
          { error: "ID do caso é obrigatório" },
          { status: 400 },
        );
      }

      const body = await request.json();
      const goingToConcluido =
        Number((body as { status?: unknown })?.status) ===
        CASO_STATUS_CONCLUIDO_ID;

      const snapshot = goingToConcluido
        ? await fetchCasoSnapshot(id, {
            Authorization: authHeaders.Authorization,
          })
        : null;

      const response = await api.patch(`/projeto-casos/${id}`, body, {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      });

      if (
        goingToConcluido &&
        response.status >= 200 &&
        response.status < 300 &&
        shouldNotifyReportConcluido(snapshot) &&
        snapshot
      ) {
        const registro = Number(snapshot.caso?.id) || Number(id);
        scheduleDiscordReportConcluidoNotify(
          { Authorization: authHeaders.Authorization },
          buildReportConcluidoNotifyInput(snapshot, registro),
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
        response?: {
          status?: number;
          data?: { message?: string; error?: string };
        };
        message?: string;
      };
      console.error("Erro na API Route ao atualizar caso:", error);
      const status = err?.response?.status ?? 500;
      const errorMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Erro ao atualizar caso";
      return Response.json({ error: errorMessage }, { status });
    }
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission("delete-case", async () => {
    try {
      const { id } = await params;

      if (!id) {
        return Response.json(
          { error: "ID do caso é obrigatório" },
          { status: 400 },
        );
      }

      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const response = await api.delete(`/projeto-casos/${id}`, {
        headers: authHeaders,
      });

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
      console.error("Erro na API Route ao excluir caso:", error);
      const status = err?.response?.status ?? 500;
      const errorMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Erro ao excluir caso";
      return Response.json({ error: errorMessage }, { status });
    }
  });
}
