import { api } from "@/lib/axios";
import { withPermission } from "@/lib/api-db/with-permission";

export async function POST(
  _request: Request,
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

      const response = await api.post(
        `/sprint/liberacoes/${registro}/checklist/carregar`,
        {},
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
      console.error(
        "Erro na API Route ao carregar checklist da liberação:",
        error,
      );
      const status = error?.response?.status || 500;
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao carregar checklist da liberação";
      return Response.json({ error: errorMessage }, { status });
    }
  });
}
