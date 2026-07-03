import { getLegacyUserFromToken } from "@/lib/legacy-auth/me";
import { legacyUserSchema } from "@/lib/validators/db/legacy-user";

export async function resolveSquadSetorFromSession(
  authorizationHeader: { Authorization: string },
): Promise<string | Response> {
  try {
    const raw = await getLegacyUserFromToken(authorizationHeader);
    const parsed = legacyUserSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Usuário autenticado inválido." },
        { status: 401 },
      );
    }
    return parsed.data.setor;
  } catch {
    return Response.json(
      { success: false, error: "Não autorizado" },
      { status: 401 },
    );
  }
}
