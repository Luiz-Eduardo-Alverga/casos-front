import { api } from "@/lib/axios";
import { withPermission } from "@/lib/api-db/with-permission";
import type { AddLiberacaoVersoesRequest } from "@/interfaces/liberacao";

function validateAddLiberacaoVersoesBody(
  body: AddLiberacaoVersoesRequest,
): Response | null {
  if (!Array.isArray(body?.versoes) || body.versoes.length === 0) {
    return Response.json(
      { error: "versoes é obrigatório e deve conter ao menos um item" },
      { status: 400 },
    );
  }
  return null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ registro: string }> },
) {
  return withPermission("edit-release", async (session) => {
    try {
      const { registro } = await params;

      if (!registro) {
        return Response.json(
          { error: "Parametro registro é obrigatório" },
          { status: 400 },
        );
      }

      const body = (await request.json()) as AddLiberacaoVersoesRequest;
      const validationError = validateAddLiberacaoVersoesBody(body);
      if (validationError) return validationError;

      const response = await api.post(
        `/sprint/liberacoes/${registro}/versoes`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
            ...session.authorizationHeader,
          },
        },
      );

      return Response.json(response.data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("Erro na API Route ao adicionar versões à liberação:", error);
      const status = error?.response?.status || 500;
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao adicionar versões à liberação";
      return Response.json({ error: errorMessage }, { status });
    }
  });
}
