import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";
import type { ClonarSgpCadastroRequest } from "@/interfaces/sgp-cadastro";

function extractApiError(error: unknown, fallback: string) {
  const err = error as {
    response?: {
      status?: number;
      data?: { message?: string; error?: string };
    };
    message?: string;
  };
  return {
    status: err?.response?.status ?? 500,
    message:
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      fallback,
  };
}

/** Cria um projeto novo a partir do projeto `{id}` (decisões #2 e #10 de docs/projetos). */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission("create-project", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }
      const { id } = await params;
      if (!id) {
        return Response.json(
          { error: "ID do projeto de origem é obrigatório" },
          { status: 400 },
        );
      }

      const body = (await request.json()) as Partial<ClonarSgpCadastroRequest>;
      const nome = body?.nome_projeto?.trim();
      if (!nome) {
        return Response.json(
          { error: "Nome do projeto é obrigatório" },
          { status: 400 },
        );
      }
      if (!body.data_inicio || !body.data_fim) {
        return Response.json(
          { error: "Data de início e data de fim são obrigatórias" },
          { status: 400 },
        );
      }

      const payload: ClonarSgpCadastroRequest = {
        nome_projeto: nome,
        data_inicio: body.data_inicio,
        data_fim: body.data_fim,
      };

      const response = await api.post(
        `/sgp-cadastros/${encodeURIComponent(id)}/clonar`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
        },
      );

      return Response.json(response.data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      console.error("Erro na API Route ao clonar projeto:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao clonar projeto",
      );
      return Response.json({ error: message }, { status });
    }
  });
}
