import { api } from "@/lib/axios";
import { withPermission } from "@/lib/api-db/with-permission";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ registro: string }> },
) {
  return withPermission("list-release", async (session) => {
    try {
      const { registro } = await params;

      if (!registro) {
        return Response.json(
          { error: "Parametro registro é obrigatório" },
          { status: 400 },
        );
      }

      const response = await api.get(
        `/sprint/liberacoes/${registro}/checklist`,
        {
          headers: session.authorizationHeader,
        },
      );

      return Response.json(response.data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error(
        "Erro na API Route ao buscar checklist da liberação:",
        error,
      );
      const status = error?.response?.status || 500;
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao buscar checklist da liberação";
      return Response.json({ error: errorMessage }, { status });
    }
  });
}
