import { api } from "@/lib/axios";
import { withPermission } from "@/lib/api-db/with-permission";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ registro: string; sequencia: string }> },
) {
  return withPermission("edit-release", async (session) => {
    try {
      const { registro, sequencia } = await params;

      if (!registro) {
        return Response.json(
          { error: "Parametro registro é obrigatório" },
          { status: 400 },
        );
      }

      if (!sequencia) {
        return Response.json(
          { error: "Parametro sequencia é obrigatório" },
          { status: 400 },
        );
      }

      const response = await api.delete(
        `/sprint/liberacoes/${registro}/versoes/${sequencia}`,
        { headers: session.authorizationHeader },
      );

      if (response.status === 204) {
        return new Response(null, { status: 204 });
      }

      return Response.json(response.data ?? { success: true }, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("Erro na API Route ao excluir versão da liberação:", error);
      const status = error?.response?.status || 500;
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao excluir versão da liberação";
      return Response.json({ error: errorMessage }, { status });
    }
  });
}
