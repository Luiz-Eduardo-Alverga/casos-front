import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withPermission("edit-case", async () => {
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

      const response = await api.patch(`/projeto-casos/${id}`, body, {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
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
  { params }: { params: Promise<{ id: string }> }
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
