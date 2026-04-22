import { cookies } from "next/headers";
import { api } from "@/lib/axios";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/lib/auth-server";
import {
  appUserToSummary,
  syncAppUserAndPermissions,
  SyncAppUserValidationError,
} from "@/lib/auth/sync-app-user";
import { LegacyAuthMeError } from "@/lib/legacy-auth/me";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await api.post("/auth/login", body);
    const data = await response.data;

    const token = data?.authorization?.token;
    const user = data?.user;

    if (!token || !user) {
      return Response.json(
        { error: "Resposta de login inválida" },
        { status: 502 }
      );
    }

    const authHeader = { Authorization: `Bearer ${token}` };
    let syncResult: Awaited<ReturnType<typeof syncAppUserAndPermissions>>;
    try {
      syncResult = await syncAppUserAndPermissions(authHeader, {
        legacyUser: user,
      });
    } catch (e) {
      console.error("Erro ao sincronizar usuário com o banco:", e);
      if (e instanceof LegacyAuthMeError) {
        const status =
          e.statusCode >= 400 && e.statusCode < 600 ? e.statusCode : 502;
        return Response.json({ error: e.message }, { status });
      }
      if (e instanceof SyncAppUserValidationError) {
        return Response.json({ error: e.message }, { status: 502 });
      }
      return Response.json(
        { error: "Erro ao sincronizar usuário com o banco local" },
        { status: 500 },
      );
    }

    const store = await cookies();
    store.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

    const { permissions, appUser } = syncResult;

    // Não expor o token no body — apenas user, permissões locais e success
    return Response.json(
      {
        success: true,
        user,
        permissions,
        appUser: appUserToSummary(appUser),
      },
      {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Erro na API Route de login:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao processar requisição de login";
    return Response.json({ error: errorMessage }, { status });
  }
}
