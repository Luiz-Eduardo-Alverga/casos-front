import { api } from "@/lib/axios";
import { withPermission } from "@/lib/api-db/with-permission";
import type { UpdateLiberacaoChecklistItemRequest } from "@/interfaces/liberacao";

function validateUpdateChecklistItemBody(
  body: UpdateLiberacaoChecklistItemRequest,
): Response | null {
  if (typeof body?.checado !== "boolean") {
    return Response.json(
      { error: "checado é obrigatório e deve ser boolean" },
      { status: 400 },
    );
  }
  return null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ registro: string; itemId: string }> },
) {
  return withPermission("edit-release", async (session) => {
    try {
      const { registro, itemId } = await params;

      if (!registro) {
        return Response.json(
          { error: "Parametro registro é obrigatório" },
          { status: 400 },
        );
      }

      if (!itemId) {
        return Response.json(
          { error: "Parametro itemId é obrigatório" },
          { status: 400 },
        );
      }

      const body = (await request.json()) as UpdateLiberacaoChecklistItemRequest;
      const validationError = validateUpdateChecklistItemBody(body);
      if (validationError) return validationError;

      const response = await api.put(
        `/sprint/liberacoes/${registro}/checklist/${itemId}`,
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
      console.error(
        "Erro na API Route ao atualizar item do checklist:",
        error,
      );
      const status = error?.response?.status || 500;
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao atualizar item do checklist";
      return Response.json({ error: errorMessage }, { status });
    }
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ registro: string; itemId: string }> },
) {
  return withPermission("edit-release", async (session) => {
    try {
      const { registro, itemId } = await params;

      if (!registro) {
        return Response.json(
          { error: "Parametro registro é obrigatório" },
          { status: 400 },
        );
      }

      if (!itemId) {
        return Response.json(
          { error: "Parametro itemId é obrigatório" },
          { status: 400 },
        );
      }

      const response = await api.delete(
        `/sprint/liberacoes/${registro}/checklist/${itemId}`,
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
      console.error(
        "Erro na API Route ao excluir item do checklist:",
        error,
      );
      const status = error?.response?.status || 500;
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao excluir item do checklist";
      return Response.json({ error: errorMessage }, { status });
    }
  });
}
